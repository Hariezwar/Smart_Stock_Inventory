from fastapi import HTTPException
from sqlalchemy.orm import Session

from .. import models
from .email_service import send_low_stock_alert, send_purchase_order_email


def serialize_alert(product: models.Product) -> dict:
    supplier = product.supplier
    return {
        "product_id": product.id,
        "product_name": product.name,
        "supplier_id": supplier.id if supplier else None,
        "supplier_name": supplier.name if supplier else None,
        "supplier_email": supplier.email if supplier else None,
        "severity": "Critical" if product.stock <= 0 else "Warning",
        "message": (
            f"{product.name} is out of stock!"
            if product.stock <= 0
            else f"{product.name} is running low (Stock: {product.stock})."
        ),
        "suggested_reorder": product.optimal_level - product.stock if product.stock < product.optimal_level else 0,
    }


def get_product_or_404(db: Session, product_id: int) -> models.Product:
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


def list_alerts(db: Session) -> list[dict]:
    low_stock_items = db.query(models.Product).filter(models.Product.stock <= models.Product.reorder_level).all()
    dismissals = {
        dismissal.product_id: dismissal
        for dismissal in db.query(models.AlertDismissal).all()
    }

    alerts = []
    for product in low_stock_items:
        dismissal = dismissals.get(product.id)
        if dismissal and dismissal.dismissed_stock == product.stock:
            continue
        alerts.append(serialize_alert(product))
    return alerts


def send_alert_email(db: Session, product_id: int) -> dict:
    product = get_product_or_404(db, product_id)
    if not product.supplier_id or not product.supplier:
        raise HTTPException(status_code=400, detail="This product has no supplier assigned")
    if not product.supplier.email:
        raise HTTPException(status_code=400, detail="The assigned supplier does not have an email address")

    suggested_order = product.optimal_level - product.stock if product.stock < product.optimal_level else 0
    if not send_low_stock_alert(
        recipient=product.supplier.email,
        supplier_name=product.supplier.name,
        product_name=product.name,
        stock=product.stock,
        reorder_level=product.reorder_level,
        suggested_order=suggested_order,
    ):
        raise HTTPException(status_code=500, detail="Failed to send low-stock email to the supplier")

    return {"message": f"Low-stock email sent to {product.supplier.email} for {product.name}"}


def create_purchase_order_from_alert(db: Session, product_id: int, created_by: str) -> models.PurchaseOrder:
    product = get_product_or_404(db, product_id)
    if not product.supplier_id or not product.supplier:
        raise HTTPException(status_code=400, detail="This product has no supplier assigned")
    if not product.supplier.email:
        raise HTTPException(status_code=400, detail="The assigned supplier does not have an email address")

    suggested_reorder = product.optimal_level - product.stock if product.stock < product.optimal_level else 0
    if suggested_reorder <= 0:
        raise HTTPException(status_code=400, detail="This product does not need a reorder right now")

    order = models.PurchaseOrder(
        product_id=product.id,
        supplier_id=product.supplier.id,
        quantity=suggested_reorder,
        unit_cost=product.cost_price or 0.0,
        total_cost=(product.cost_price or 0.0) * suggested_reorder,
        status="Pending",
        created_by=created_by,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    try:
        send_purchase_order_email(
            recipient=product.supplier.email,
            supplier_name=product.supplier.name,
            product_name=product.name,
            sku=product.sku,
            quantity=order.quantity,
            unit_cost=order.unit_cost,
            total_cost=order.total_cost,
            created_by=created_by,
        )
    except Exception as exc:  # noqa: BLE001
        order.status = "Email Failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Purchase order created, but supplier email failed: {exc}")

    return order


def dismiss_alert(db: Session, product_id: int) -> dict:
    product = get_product_or_404(db, product_id)
    if product.stock > product.reorder_level:
        raise HTTPException(status_code=400, detail="This product does not currently have an active alert")

    dismissal = db.query(models.AlertDismissal).filter(models.AlertDismissal.product_id == product_id).first()
    if dismissal:
        dismissal.dismissed_stock = product.stock
    else:
        dismissal = models.AlertDismissal(product_id=product_id, dismissed_stock=product.stock)
        db.add(dismissal)

    db.commit()
    return {"message": f"Alert dismissed for {product.name}"}
