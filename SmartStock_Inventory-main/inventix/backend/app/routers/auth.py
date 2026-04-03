from typing import Optional

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from ..core import auth, database
from .. import models, schemas
from ..services import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = Field(default=None, min_length=8)


class PasswordReset(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class SecurityQuestionSetup(BaseModel):
    question: str = Field(min_length=5, max_length=255)
    answer: str = Field(min_length=1, max_length=255)


class SecurityQuestionAnswer(BaseModel):
    answer: str = Field(min_length=1, max_length=255)


@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    return auth_service.register_user(db, user)


@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(database.get_db),
    otp_token: Optional[str] = None,
    security_answer: Optional[str] = None,
):
    return auth_service.authenticate_user(
        db,
        identifier=form_data.username,
        password=form_data.password,
        otp_token=otp_token,
        security_answer=security_answer,
    )


@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserResponse)
def update_profile(
    updates: UserUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return auth_service.update_profile(
        db,
        current_user,
        username=updates.username,
        email=updates.email,
        current_password=updates.current_password,
        new_password=updates.new_password,
    )


@router.post("/me/avatar", response_model=schemas.UserResponse)
async def upload_profile_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return await auth_service.upload_profile_avatar(db, current_user, avatar)


@router.post("/reset-password")
def reset_password(data: PasswordReset, db: Session = Depends(database.get_db)):
    return auth_service.request_password_reset(db, data.email)


@router.post("/reset-password/confirm")
def confirm_reset_password(data: PasswordResetConfirm, db: Session = Depends(database.get_db)):
    return auth_service.confirm_password_reset(db, data.token, data.new_password)


@router.post("/security-question/setup", response_model=schemas.UserResponse)
def setup_security_question(
    data: SecurityQuestionSetup,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    return auth_service.setup_security_question(db, current_user, data.question, data.answer)


@router.post("/security-question/disable", response_model=schemas.UserResponse)
def disable_security_question(
    data: SecurityQuestionAnswer,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(database.get_db),
):
    return auth_service.disable_security_question(db, current_user, data.answer)
