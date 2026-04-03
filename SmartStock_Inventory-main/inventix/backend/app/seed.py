"""Seed demo inventory data for first-run local development."""

import datetime
import random

from . import models
from .core.database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

SUPPLIERS = [
    {"name": "TechNova Supplies", "email": "orders@technova.com", "phone": "+1-800-111-2233", "address": "12 Silicon Ave, San Jose, CA"},
    {"name": "GlobalMart Wholesale", "email": "supply@globalmart.com", "phone": "+1-800-444-5566", "address": "99 Commerce Blvd, Chicago, IL"},
    {"name": "EcoPackers Ltd.", "email": "info@ecopackers.com", "phone": "+44-20-7946-0958", "address": "7 Green Lane, London, UK"},
    {"name": "AsiaTech Distributors", "email": "sales@asiatech.sg", "phone": "+65-6323-1111", "address": "88 Marina Bay, Singapore"},
    {"name": "FoodFirst Co.", "email": "bulk@foodfirst.com", "phone": "+1-888-321-9876", "address": "34 Harvest Road, Dallas, TX"},
]

PRODUCTS = [
    {"name": "Wireless Bluetooth Headphones", "sku": "ELEC-0001", "category": "Electronics", "unit_price": 79.99, "cost_price": 42.00, "stock": 245, "reorder_level": 50, "optimal_level": 300, "status": "Optimal", "supplier_idx": 0},
    {"name": "USB-C Charging Hub 7-Port", "sku": "ELEC-0002", "category": "Electronics", "unit_price": 49.99, "cost_price": 22.50, "stock": 18, "reorder_level": 30, "optimal_level": 150, "status": "Low Stock", "supplier_idx": 0},
    {"name": "Mechanical Keyboard RGB", "sku": "ELEC-0003", "category": "Electronics", "unit_price": 129.99, "cost_price": 68.00, "stock": 3, "reorder_level": 20, "optimal_level": 100, "status": "Critical", "supplier_idx": 3},
    {"name": "27-inch 4K Monitor", "sku": "ELEC-0004", "category": "Electronics", "unit_price": 399.99, "cost_price": 220.00, "stock": 82, "reorder_level": 15, "optimal_level": 60, "status": "Overstock", "supplier_idx": 3},
    {"name": "Noise Cancelling Earbuds", "sku": "ELEC-0005", "category": "Electronics", "unit_price": 59.99, "cost_price": 28.00, "stock": 190, "reorder_level": 40, "optimal_level": 200, "status": "Optimal", "supplier_idx": 0},
    {"name": "Laptop Stand Aluminum", "sku": "ELEC-0006", "category": "Electronics", "unit_price": 34.99, "cost_price": 14.00, "stock": 0, "reorder_level": 25, "optimal_level": 120, "status": "Critical", "supplier_idx": 3},
    {"name": "Webcam 1080p HD", "sku": "ELEC-0007", "category": "Electronics", "unit_price": 69.99, "cost_price": 32.00, "stock": 67, "reorder_level": 20, "optimal_level": 80, "status": "Optimal", "supplier_idx": 0},
    {"name": "Portable SSD 1TB", "sku": "ELEC-0008", "category": "Electronics", "unit_price": 99.99, "cost_price": 55.00, "stock": 140, "reorder_level": 30, "optimal_level": 100, "status": "Overstock", "supplier_idx": 3},
    {"name": "Ergonomic Office Chair", "sku": "OFFI-0001", "category": "Office", "unit_price": 349.00, "cost_price": 180.00, "stock": 12, "reorder_level": 15, "optimal_level": 50, "status": "Low Stock", "supplier_idx": 1},
    {"name": "Standing Desk 60-inch", "sku": "OFFI-0002", "category": "Office", "unit_price": 499.00, "cost_price": 260.00, "stock": 8, "reorder_level": 10, "optimal_level": 40, "status": "Low Stock", "supplier_idx": 1},
    {"name": "Whiteboard 4x6 ft", "sku": "OFFI-0003", "category": "Office", "unit_price": 89.99, "cost_price": 40.00, "stock": 55, "reorder_level": 10, "optimal_level": 40, "status": "Overstock", "supplier_idx": 1},
    {"name": "File Cabinet 4-Drawer", "sku": "OFFI-0004", "category": "Office", "unit_price": 229.00, "cost_price": 110.00, "stock": 27, "reorder_level": 10, "optimal_level": 30, "status": "Optimal", "supplier_idx": 1},
    {"name": "Desk Organizer Set", "sku": "OFFI-0005", "category": "Office", "unit_price": 29.99, "cost_price": 11.00, "stock": 210, "reorder_level": 40, "optimal_level": 150, "status": "Overstock", "supplier_idx": 1},
    {"name": "Polo Shirt (Pack of 5)", "sku": "CLTH-0001", "category": "Clothing", "unit_price": 44.99, "cost_price": 18.00, "stock": 340, "reorder_level": 80, "optimal_level": 300, "status": "Overstock", "supplier_idx": 2},
    {"name": "Running Shoes Men Size 10", "sku": "CLTH-0002", "category": "Clothing", "unit_price": 89.99, "cost_price": 42.00, "stock": 5, "reorder_level": 20, "optimal_level": 80, "status": "Critical", "supplier_idx": 2},
    {"name": "Winter Jacket Unisex", "sku": "CLTH-0003", "category": "Clothing", "unit_price": 119.99, "cost_price": 58.00, "stock": 73, "reorder_level": 25, "optimal_level": 80, "status": "Optimal", "supplier_idx": 2},
    {"name": "Cotton Socks Bundle 12-pk", "sku": "CLTH-0004", "category": "Clothing", "unit_price": 19.99, "cost_price": 7.00, "stock": 600, "reorder_level": 100, "optimal_level": 400, "status": "Overstock", "supplier_idx": 2},
    {"name": "Organic Olive Oil 1L", "sku": "FOOD-0001", "category": "Food", "unit_price": 12.99, "cost_price": 6.00, "stock": 90, "reorder_level": 50, "optimal_level": 200, "status": "Low Stock", "supplier_idx": 4},
    {"name": "Whole Wheat Pasta 500g", "sku": "FOOD-0002", "category": "Food", "unit_price": 3.49, "cost_price": 1.20, "stock": 12, "reorder_level": 100, "optimal_level": 500, "status": "Critical", "supplier_idx": 4},
    {"name": "Almond Milk 1L (Pack 6)", "sku": "FOOD-0003", "category": "Food", "unit_price": 15.99, "cost_price": 8.50, "stock": 155, "reorder_level": 60, "optimal_level": 240, "status": "Optimal", "supplier_idx": 4},
    {"name": "Green Tea Bags 100-pk", "sku": "FOOD-0004", "category": "Food", "unit_price": 8.99, "cost_price": 3.50, "stock": 320, "reorder_level": 50, "optimal_level": 200, "status": "Overstock", "supplier_idx": 4},
    {"name": "Python for Data Science", "sku": "BOOK-0001", "category": "Books", "unit_price": 39.99, "cost_price": 18.00, "stock": 45, "reorder_level": 15, "optimal_level": 60, "status": "Optimal", "supplier_idx": 1},
    {"name": "Business Management 101", "sku": "BOOK-0002", "category": "Books", "unit_price": 34.99, "cost_price": 14.00, "stock": 7, "reorder_level": 10, "optimal_level": 50, "status": "Low Stock", "supplier_idx": 1},
    {"name": "The Art of Negotiation", "sku": "BOOK-0003", "category": "Books", "unit_price": 24.99, "cost_price": 9.00, "stock": 110, "reorder_level": 20, "optimal_level": 80, "status": "Overstock", "supplier_idx": 1},
]


def seed() -> None:
    db = SessionLocal()
    try:
        supplier_count = db.query(models.Supplier).count()
        product_count = db.query(models.Product).count()
        purchase_history_count = db.query(models.PurchaseHistory).count()

        if supplier_count or product_count or purchase_history_count:
            print(
                "[SKIP] Seed skipped because inventory data already exists "
                f"(suppliers={supplier_count}, products={product_count}, purchases={purchase_history_count})."
            )
            return

        supplier_ids = []
        for supplier_data in SUPPLIERS:
            supplier = models.Supplier(**supplier_data)
            db.add(supplier)
            db.flush()
            supplier_ids.append(supplier.id)

        product_ids = []
        for product_data in PRODUCTS:
            payload = dict(product_data)
            supplier_id = supplier_ids[payload.pop("supplier_idx")]
            product = models.Product(**payload, supplier_id=supplier_id)
            db.add(product)
            db.flush()
            product_ids.append(product.id)

        for _ in range(40):
            days_ago = random.randint(1, 180)
            product_id = random.choice(product_ids)
            quantity = random.randint(10, 100)
            product = db.query(models.Product).filter(models.Product.id == product_id).first()
            history = models.PurchaseHistory(
                product_id=product_id,
                supplier_id=product.supplier_id,
                quantity=quantity,
                cost=quantity * product.cost_price,
                purchase_date=datetime.datetime.utcnow() - datetime.timedelta(days=days_ago),
            )
            db.add(history)

        db.commit()
        print(f"[OK] Seeded {len(SUPPLIERS)} suppliers, {len(PRODUCTS)} products, 40 purchase records.")
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        print(f"[ERROR] Seed error: {exc}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
