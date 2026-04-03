from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..core import database, auth
from .. import models, schemas

router = APIRouter(
    prefix="/inventory",
    tags=["Inventory"]
)

@router.get("/", response_model=List[schemas.InventoryItemResponse])
def get_inventory(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    items = db.query(models.InventoryItem).offset(skip).limit(limit).all()
    return items

@router.post("/", response_model=schemas.InventoryItemResponse)
def add_item(item: schemas.InventoryItemCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.sku == item.sku).first()
    if db_item:
        raise HTTPException(status_code=400, detail="SKU already exists")
    new_item = models.InventoryItem(**item.model_dump())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=schemas.InventoryItemResponse)
def update_item(item_id: int, item: schemas.InventoryItemCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for var, value in vars(item).items():
        setattr(db_item, var, value) if value is not None else None

    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}")
def delete_item(item_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"detail": "Item deleted"}
