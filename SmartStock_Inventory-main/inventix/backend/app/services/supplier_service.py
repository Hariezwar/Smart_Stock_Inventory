from fastapi import HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas


def list_suppliers(db: Session, skip: int = 0, limit: int = 100) -> list[models.Supplier]:
    return db.query(models.Supplier).offset(skip).limit(limit).all()


def get_supplier_or_404(db: Session, supplier_id: int) -> models.Supplier:
    supplier = db.query(models.Supplier).filter(models.Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier


def create_supplier(db: Session, supplier: schemas.SupplierCreate) -> models.Supplier:
    new_supplier = models.Supplier(**supplier.model_dump())
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier


def update_supplier(db: Session, supplier_id: int, supplier: schemas.SupplierCreate) -> models.Supplier:
    db_supplier = get_supplier_or_404(db, supplier_id)
    for field, value in supplier.model_dump().items():
        setattr(db_supplier, field, value)

    db.commit()
    db.refresh(db_supplier)
    return db_supplier


def delete_supplier(db: Session, supplier_id: int) -> None:
    get_supplier_or_404(db, supplier_id)

    db.query(models.Product).filter(models.Product.supplier_id == supplier_id).update({"supplier_id": None})
    db.query(models.PurchaseHistory).filter(models.PurchaseHistory.supplier_id == supplier_id).update({"supplier_id": None})
    db.query(models.PurchaseOrder).filter(models.PurchaseOrder.supplier_id == supplier_id).update({"supplier_id": None})
    db.query(models.Supplier).filter(models.Supplier.id == supplier_id).delete()
    db.commit()
