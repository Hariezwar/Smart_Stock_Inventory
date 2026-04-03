from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core import database, auth
from .. import models, schemas
from ..services import alert_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("/")
def get_alerts(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return alert_service.list_alerts(db)


@router.post("/{product_id}/email")
def send_alert_email(product_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return alert_service.send_alert_email(db, product_id)


@router.post("/{product_id}/create-order", response_model=schemas.PurchaseOrderResponse)
def create_purchase_order_from_alert(
    product_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return alert_service.create_purchase_order_from_alert(db, product_id, current_user.username)


@router.delete("/{product_id}")
def dismiss_alert(
    product_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return alert_service.dismiss_alert(db, product_id)
