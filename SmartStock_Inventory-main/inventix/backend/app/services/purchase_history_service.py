from sqlalchemy.orm import Session

from .. import models, schemas


def list_purchase_history(db: Session, skip: int = 0, limit: int = 100) -> list[models.PurchaseHistory]:
    return (
        db.query(models.PurchaseHistory)
        .order_by(models.PurchaseHistory.purchase_date.desc(), models.PurchaseHistory.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_purchase_history(db: Session, order: schemas.PurchaseHistoryCreate) -> models.PurchaseHistory:
    new_order = models.PurchaseHistory(**order.model_dump())
    db.add(new_order)

    product = db.query(models.Product).filter(models.Product.id == order.product_id).first()
    if product:
        product.stock += order.quantity

    db.commit()
    db.refresh(new_order)
    return new_order
