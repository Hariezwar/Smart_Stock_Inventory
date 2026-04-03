from sqlalchemy import func, text
from sqlalchemy.orm import Session

from .. import models


def get_dashboard_stats(db: Session) -> dict:
    all_products = db.query(models.Product).all()

    total_skus = db.query(models.Product).count()
    total_value = sum(product.stock * product.unit_price for product in all_products)
    low_stock_alerts = sum(1 for product in all_products if product.stock <= product.reorder_level)

    categories_raw = (
        db.query(models.Product.category, func.sum(models.Product.stock))
        .group_by(models.Product.category)
        .all()
    )
    category_labels = [row[0] for row in categories_raw]
    category_data = [int(row[1] or 0) for row in categories_raw]

    optimal = sum(1 for product in all_products if product.stock > product.reorder_level and product.stock <= product.optimal_level)
    low = sum(1 for product in all_products if 0 < product.stock <= product.reorder_level)
    critical = sum(1 for product in all_products if product.stock <= 0)
    overstock = sum(1 for product in all_products if product.stock > product.optimal_level)

    monthly = db.execute(
        text(
            """
            SELECT strftime('%Y-%m', purchase_date) as month, SUM(quantity) as qty
            FROM purchase_history
            GROUP BY month
            ORDER BY month DESC
            LIMIT 7
            """
        )
    ).fetchall()
    monthly_reversed = list(reversed(monthly))
    trend_labels = [row[0] for row in monthly_reversed]
    trend_data = [int(row[1] or 0) for row in monthly_reversed]

    return {
        "total_skus": total_skus,
        "total_value": round(total_value, 2),
        "low_stock_alerts": low_stock_alerts,
        "turnover_rate": "4.2x",
        "category_chart": {"labels": category_labels, "data": category_data},
        "status_chart": {
            "labels": ["Optimal", "Low Stock", "Critical", "Overstock"],
            "data": [optimal, low, critical, overstock],
        },
        "trend_chart": {"labels": trend_labels, "data": trend_data},
    }
