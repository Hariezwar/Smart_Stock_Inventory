from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core import database, auth
from .. import models
from ..services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return dashboard_service.get_dashboard_stats(db)
