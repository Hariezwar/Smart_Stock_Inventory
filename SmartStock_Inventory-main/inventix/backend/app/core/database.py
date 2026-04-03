from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Keep using the original project-level SQLite file so existing accounts/data persist.
BASE_DIR = Path(__file__).resolve().parents[3]
DB_PATH = BASE_DIR / "inventix.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH.as_posix()}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_user_reset_columns():
    with engine.begin() as connection:
        columns = {
            row[1]
            for row in connection.exec_driver_sql("PRAGMA table_info(users)").fetchall()
        }
        if "security_question" not in columns:
            connection.exec_driver_sql("ALTER TABLE users ADD COLUMN security_question VARCHAR")
        if "security_answer_hash" not in columns:
            connection.exec_driver_sql("ALTER TABLE users ADD COLUMN security_answer_hash VARCHAR")
        if "profile_image_url" not in columns:
            connection.exec_driver_sql("ALTER TABLE users ADD COLUMN profile_image_url VARCHAR")
        if "reset_token" not in columns:
            connection.exec_driver_sql("ALTER TABLE users ADD COLUMN reset_token VARCHAR")
        if "reset_token_expires_at" not in columns:
            connection.exec_driver_sql("ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
