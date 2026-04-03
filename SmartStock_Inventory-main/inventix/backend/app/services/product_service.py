from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import models, schemas


def compute_status(product: models.Product) -> str:
    if product.stock <= 0:
        return "Critical"
    if product.stock <= product.reorder_level:
        return "Low Stock"
    if product.stock > product.optimal_level:
        return "Overstock"
    return "Optimal"


def sync_status(product: models.Product) -> models.Product:
    product.status = compute_status(product)
    return product


def list_products(db: Session, skip: int = 0, limit: int = 100) -> list[models.Product]:
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return [sync_status(product) for product in products]


def get_product_or_404(db: Session, product_id: int) -> models.Product:
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def resolve_supplier_id(product: schemas.ProductCreate, db: Session) -> int | None:
    if product.supplier_id is not None:
        supplier = db.query(models.Supplier).filter(models.Supplier.id == product.supplier_id).first()
        if not supplier:
            raise HTTPException(status_code=400, detail="Selected supplier was not found")
        return supplier.id

    if not product.supplier or not product.supplier.name.strip():
        return None

    supplier_email = product.supplier.email.strip().lower()
    supplier_name = product.supplier.name.strip()

    existing_supplier = None
    if supplier_email:
        existing_supplier = db.query(models.Supplier).filter(
            func.lower(models.Supplier.email) == supplier_email
        ).first()

    if not existing_supplier:
        existing_supplier = db.query(models.Supplier).filter(
            func.lower(models.Supplier.name) == supplier_name.lower()
        ).first()

    if existing_supplier:
        existing_supplier.email = supplier_email
        existing_supplier.phone = product.supplier.phone.strip()
        existing_supplier.address = product.supplier.address.strip()
        db.flush()
        return existing_supplier.id

    new_supplier = models.Supplier(
        name=supplier_name,
        email=supplier_email,
        phone=product.supplier.phone.strip(),
        address=product.supplier.address.strip(),
    )
    db.add(new_supplier)
    db.flush()
    return new_supplier.id


def create_product(db: Session, product: schemas.ProductCreate) -> models.Product:
    existing_product = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if existing_product:
        raise HTTPException(status_code=400, detail="SKU already exists")

    payload = product.model_dump(exclude={"supplier"})
    payload["supplier_id"] = resolve_supplier_id(product, db)

    new_product = models.Product(**payload)
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return sync_status(new_product)


def update_product(db: Session, product_id: int, product: schemas.ProductCreate) -> models.Product:
    db_product = get_product_or_404(db, product_id)

    payload = product.model_dump(exclude={"supplier"})
    payload["supplier_id"] = resolve_supplier_id(product, db)

    for field, value in payload.items():
        setattr(db_product, field, value)

    db.commit()
    db.refresh(db_product)
    return sync_status(db_product)


def delete_product(db: Session, product_id: int) -> None:
    db_product = get_product_or_404(db, product_id)

    db.query(models.AlertDismissal).filter(models.AlertDismissal.product_id == product_id).delete()
    db.query(models.PurchaseHistory).filter(models.PurchaseHistory.product_id == product_id).delete()
    db.query(models.PurchaseOrder).filter(models.PurchaseOrder.product_id == product_id).delete()

    db.delete(db_product)
    db.commit()
