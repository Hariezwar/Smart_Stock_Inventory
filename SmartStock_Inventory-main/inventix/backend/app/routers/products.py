from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core import database, auth
from .. import models, schemas
from ..services import product_service

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[schemas.ProductResponse])
def get_products(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return product_service.list_products(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.ProductResponse)
def add_product(product: schemas.ProductCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return product_service.create_product(db, product)

@router.put("/{product_id}", response_model=schemas.ProductResponse)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return product_service.update_product(db, product_id, product)

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    product_service.delete_product(db, product_id)
    return {"detail": "Product deleted"}
