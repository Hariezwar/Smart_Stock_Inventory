from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from . import models
from .core import database
from .routers import alerts, auth, chatbot, dashboard, orders, products, search, suppliers
from .seed import seed as run_seed


def configure_persistence() -> None:
    models.Base.metadata.create_all(bind=database.engine)
    database.ensure_user_reset_columns()
    run_seed()


def register_routes(app: FastAPI) -> None:
    app.include_router(auth.router)
    app.include_router(products.router)
    app.include_router(suppliers.router)
    app.include_router(dashboard.router)
    app.include_router(chatbot.router)
    app.include_router(orders.router)
    app.include_router(alerts.router)
    app.include_router(search.router)


def mount_static_files(app: FastAPI) -> None:
    uploads_dir = Path(__file__).resolve().parent.parent / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")


def create_app() -> FastAPI:
    configure_persistence()

    app = FastAPI(title="Inventix - Smart Inventory Optimizer", version="2.0.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost", "http://127.0.0.1"],
        allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_routes(app)
    mount_static_files(app)
    return app


app = create_app()

@app.get("/")
def root():
    return {"message": "Welcome to Inventix API v2.0"}
