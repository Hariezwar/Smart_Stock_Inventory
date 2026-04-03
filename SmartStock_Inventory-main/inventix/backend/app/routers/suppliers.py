from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..core import database, auth
from .. import models, schemas
from ..services import supplier_service

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])

@router.get("/", response_model=List[schemas.SupplierResponse])
def get_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return supplier_service.list_suppliers(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.SupplierResponse)
def add_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return supplier_service.create_supplier(db, supplier)

@router.put("/{supplier_id}", response_model=schemas.SupplierResponse)
def update_supplier(supplier_id: int, supplier: schemas.SupplierCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return supplier_service.update_supplier(db, supplier_id, supplier)

@router.delete("/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    supplier_service.delete_supplier(db, supplier_id)
    return {"detail": "Supplier deleted"}
