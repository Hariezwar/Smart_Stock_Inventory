from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..core import database, auth
from .. import models
from ..services import chatbot_service

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)

class ChatMessage(BaseModel):
    message: str

@router.post("/ask")
def ask_chatbot(chat: ChatMessage, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    products = db.query(models.Product).all()
    reply = chatbot_service.get_chatbot_reply(products, chat.message)
    return {"reply": reply}
