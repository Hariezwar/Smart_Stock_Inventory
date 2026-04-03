from sqlalchemy import or_
from sqlalchemy.orm import Session

from .. import models


def global_search(db: Session, query: str) -> dict:
    if not query or len(query.strip()) < 1:
        return {"products": [], "suppliers": []}

    q_like = f"%{query.lower()}%"

    products = (
        db.query(models.Product)
        .filter(
            or_(
                models.Product.name.ilike(q_like),
                models.Product.sku.ilike(q_like),
                models.Product.category.ilike(q_like),
            )
        )
        .limit(10)
        .all()
    )
    suppliers = (
        db.query(models.Supplier)
        .filter(
            or_(
                models.Supplier.name.ilike(q_like),
                models.Supplier.email.ilike(q_like),
            )
        )
        .limit(5)
        .all()
    )

    return {
        "products": [
            {
                "id": product.id,
                "name": product.name,
                "sku": product.sku,
                "category": product.category,
                "stock": product.stock,
                "status": product.status,
            }
            for product in products
        ],
        "suppliers": [
            {"id": supplier.id, "name": supplier.name, "email": supplier.email}
            for supplier in suppliers
        ],
    }
