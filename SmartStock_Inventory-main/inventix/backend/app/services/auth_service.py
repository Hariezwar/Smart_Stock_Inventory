from datetime import datetime, timedelta
from pathlib import Path
import secrets
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from .. import models, schemas
from ..core import auth, config
from .email_service import send_password_reset_email

AVATAR_DIR = config.BASE_DIR.parent / "uploads" / "avatars"
AVATAR_DIR.mkdir(parents=True, exist_ok=True)


def normalize_security_answer(answer: str) -> str:
    return answer.strip().lower()


def register_user(db: Session, user: schemas.UserCreate) -> models.User:
    normalized_username = user.username.strip()
    normalized_email = user.email.strip().lower()

    existing_user = db.query(models.User).filter(
        func.lower(models.User.username) == normalized_username.lower()
    ).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    existing_email = db.query(models.User).filter(
        func.lower(models.User.email) == normalized_email
    ).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = models.User(
        username=normalized_username,
        email=normalized_email,
        hashed_password=auth.get_password_hash(user.password),
    )

    if user.security_question and user.security_answer:
        new_user.security_question = user.security_question.strip()
        new_user.security_answer_hash = auth.get_password_hash(normalize_security_answer(user.security_answer))
        new_user.two_factor_enabled = True

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def authenticate_user(
    db: Session,
    identifier: str,
    password: str,
    otp_token: str | None = None,
    security_answer: str | None = None,
) -> dict:
    normalized_identifier = identifier.strip().lower()
    user = db.query(models.User).filter(
        or_(
            func.lower(models.User.username) == normalized_identifier,
            func.lower(models.User.email) == normalized_identifier,
        )
    ).first()
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.two_factor_enabled:
        if not user.security_question or not user.security_answer_hash:
            user.two_factor_enabled = False
            user.totp_secret = None
            db.commit()
        else:
            submitted_answer = security_answer or otp_token
            if not submitted_answer:
                return {
                    "requires_security_question": True,
                    "security_question": user.security_question,
                    "message": "Security answer required",
                }

            if not auth.verify_password(normalize_security_answer(submitted_answer), user.security_answer_hash):
                raise HTTPException(status_code=401, detail="Incorrect security answer")

    access_token = auth.create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer"}


def update_profile(
    db: Session,
    current_user: models.User,
    username: str | None = None,
    email: str | None = None,
    current_password: str | None = None,
    new_password: str | None = None,
) -> models.User:
    user = db.query(models.User).filter(models.User.id == current_user.id).first()

    if username and username != user.username:
        normalized_username = username.strip()
        existing_user = db.query(models.User).filter(
            func.lower(models.User.username) == normalized_username.lower()
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Username already taken")
        user.username = normalized_username

    if email and email != user.email:
        normalized_email = email.strip().lower()
        existing_email = db.query(models.User).filter(
            func.lower(models.User.email) == normalized_email
        ).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = normalized_email

    if new_password:
        if not current_password:
            raise HTTPException(status_code=400, detail="Current password required to change password")
        if not auth.verify_password(current_password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        user.hashed_password = auth.get_password_hash(new_password)

    db.commit()
    db.refresh(user)
    return user


async def upload_profile_avatar(db: Session, current_user: models.User, avatar: UploadFile) -> models.User:
    if not avatar.content_type or not avatar.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Please upload a valid image file")

    extension = Path(avatar.filename or "avatar.png").suffix.lower() or ".png"
    file_name = f"user-{current_user.id}-{uuid4().hex}{extension}"
    file_path = AVATAR_DIR / file_name

    contents = await avatar.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Profile image must be 5 MB or smaller")

    file_path.write_bytes(contents)

    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    old_avatar = user.profile_image_url
    user.profile_image_url = f"/uploads/avatars/{file_name}"
    db.commit()
    db.refresh(user)

    if old_avatar and old_avatar.startswith("/uploads/avatars/"):
        old_path = config.BASE_DIR.parent / old_avatar.lstrip("/")
        if old_path.exists() and old_path != file_path:
            old_path.unlink(missing_ok=True)

    return user


def request_password_reset(db: Session, email: str) -> dict:
    user = db.query(models.User).filter(models.User.email == email.strip().lower()).first()
    if not user:
        return {"message": "If that email exists, a reset link has been sent."}

    user.reset_token = secrets.token_urlsafe(32)
    user.reset_token_expires_at = datetime.utcnow() + timedelta(minutes=30)
    db.commit()

    try:
        send_password_reset_email(user.email, user.username, user.reset_token)
    except Exception as exc:  # noqa: BLE001
        user.reset_token = None
        user.reset_token_expires_at = None
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to send reset email: {exc}")

    return {"message": "If that email exists, a reset link has been sent."}


def confirm_password_reset(db: Session, token: str, new_password: str) -> dict:
    user = db.query(models.User).filter(models.User.reset_token == token).first()
    if not user or not user.reset_token_expires_at or user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset link is invalid or has expired")

    user.hashed_password = auth.get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()
    return {"message": "Password has been reset successfully"}


def setup_security_question(db: Session, current_user: models.User, question: str, answer: str) -> models.User:
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    normalized_question = question.strip()
    normalized_answer = normalize_security_answer(answer)

    if not normalized_question:
        raise HTTPException(status_code=400, detail="Security question is required")
    if not normalized_answer:
        raise HTTPException(status_code=400, detail="Security answer is required")

    user.security_question = normalized_question
    user.security_answer_hash = auth.get_password_hash(normalized_answer)
    user.two_factor_enabled = True
    user.totp_secret = None
    db.commit()
    db.refresh(user)
    return user


def disable_security_question(db: Session, current_user: models.User, answer: str) -> models.User:
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    if not user.two_factor_enabled or not user.security_answer_hash:
        raise HTTPException(status_code=400, detail="Security question verification is not enabled")

    if not auth.verify_password(normalize_security_answer(answer), user.security_answer_hash):
        raise HTTPException(status_code=400, detail="Incorrect security answer")

    user.two_factor_enabled = False
    user.totp_secret = None
    user.security_question = None
    user.security_answer_hash = None
    db.commit()
    db.refresh(user)
    return user
