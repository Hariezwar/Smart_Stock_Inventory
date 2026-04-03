from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core import database, auth
from .. import models
from ..services import search_service

router = APIRouter(prefix="/search", tags=["Search"])

@router.get("/")
def global_search(q: str = "", db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return search_service.global_search(db, q)
