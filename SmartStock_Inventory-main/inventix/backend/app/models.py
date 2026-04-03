from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
import datetime
from .core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    two_factor_enabled = Column(Boolean, default=False)
    totp_secret = Column(String, nullable=True)
    security_question = Column(String, nullable=True)
    security_answer_hash = Column(String, nullable=True)
    role = Column(String, default="operator") # admin, operator, user
    profile_image_url = Column(String, nullable=True)
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expires_at = Column(DateTime, nullable=True)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    sku = Column(String, unique=True, index=True)
    category = Column(String, index=True)
    unit_price = Column(Float, default=0.0)
    cost_price = Column(Float, default=0.0)
    stock = Column(Integer, default=0)
    reorder_level = Column(Integer, default=10)
    optimal_level = Column(Integer, default=50)
    status = Column(String, default="Optimal") # Optimal, Low Stock, Critical, Overstock
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))

    supplier = relationship("Supplier", back_populates="products")

class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String)
    phone = Column(String)
    address = Column(String)

    products = relationship("Product", back_populates="supplier")

class PurchaseHistory(Base):
    __tablename__ = "purchase_history"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    quantity = Column(Integer)
    cost = Column(Float)
    purchase_date = Column(DateTime, default=datetime.datetime.utcnow)


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    quantity = Column(Integer)
    unit_cost = Column(Float, default=0.0)
    total_cost = Column(Float, default=0.0)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    created_by = Column(String, nullable=True)


class AlertDismissal(Base):
    __tablename__ = "alert_dismissals"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), unique=True, index=True)
    dismissed_stock = Column(Integer, nullable=False)
    dismissed_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
