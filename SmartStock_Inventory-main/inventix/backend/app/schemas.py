from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(min_length=8)
    security_question: Optional[str] = Field(default=None, min_length=5, max_length=255)
    security_answer: Optional[str] = Field(default=None, min_length=1, max_length=255)

class UserResponse(UserBase):
    id: int
    is_active: bool
    two_factor_enabled: bool
    security_question: Optional[str] = None
    role: str
    profile_image_url: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Supplier Schemas ---
class SupplierBase(BaseModel):
    name: str
    email: str
    phone: str
    address: str

class SupplierCreate(SupplierBase):
    pass


class SupplierInlineCreate(SupplierBase):
    pass

class SupplierResponse(SupplierBase):
    id: int

    class Config:
        from_attributes = True


class SupplierSummary(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        from_attributes = True

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    sku: str
    category: str
    unit_price: float
    cost_price: float
    stock: int
    reorder_level: int
    optimal_level: int
    status: str
    supplier_id: Optional[int] = None

class ProductCreate(ProductBase):
    supplier: Optional[SupplierInlineCreate] = None

class ProductResponse(ProductBase):
    id: int
    supplier: Optional[SupplierSummary] = None

    class Config:
        from_attributes = True

# --- Purchase History Schemas ---
class PurchaseHistoryBase(BaseModel):
    product_id: int
    supplier_id: Optional[int] = None
    quantity: int
    cost: float

class PurchaseHistoryCreate(PurchaseHistoryBase):
    pass

class PurchaseHistoryResponse(PurchaseHistoryBase):
    id: int
    purchase_date: datetime

    class Config:
        from_attributes = True


class PurchaseOrderResponse(BaseModel):
    id: int
    product_id: int
    supplier_id: Optional[int] = None
    quantity: int
    unit_cost: float
    total_cost: float
    status: str
    created_at: datetime
    created_by: Optional[str] = None

    class Config:
        from_attributes = True
