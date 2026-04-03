from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core import database, auth
from .. import models, schemas
from ..services import purchase_history_service

router = APIRouter(prefix="/purchase-history", tags=["Orders"])

@router.get("/", response_model=List[schemas.PurchaseHistoryResponse])
def get_purchase_history(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return purchase_history_service.list_purchase_history(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.PurchaseHistoryResponse)
def add_purchase_history(order: schemas.PurchaseHistoryCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return purchase_history_service.create_purchase_history(db, order)
