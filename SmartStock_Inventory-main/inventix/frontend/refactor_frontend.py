import os
import re

src_dir = r"C:\Users\User\Downloads\inventix (1)\inventix\frontend\src"

def process_file(filepath, service_import, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "import axios from 'axios';" in content:
        content = content.replace("import axios from 'axios';", service_import)
        # remove API_BASE import if it exists, since services don't need it exposed typically
        # actually some components might use API_BASE for image URLs! 
        # let's just leave API_BASE alone or remove unused
        for old, new in replacements:
            content = content.replace(old, new)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

# 1. ChatbotWidget
process_file(
    os.path.join(src_dir, 'components', 'ChatbotWidget.jsx'),
    "import * as chatbotService from '../services/chatbotService';",
    [("axios.post(${API_BASE}/chatbot/ask, { message: userMsg })", "chatbotService.askChatbot(userMsg)")]
)

# 2. AlertsPage
process_file(
    os.path.join(src_dir, 'pages', 'AlertsPage.jsx'),
    "import * as alertService from '../services/alertService';",
    [
        ("axios.get(${API_BASE}/alerts/)", "alertService.getAlerts()"),
        ("axios.post(${API_BASE}/alerts//email)", "alertService.emailAlert(alert.product_id)"),
        ("axios.post(${API_BASE}/alerts//create-order)", "alertService.orderAlert(alert.product_id)"),
        ("axios.delete(${API_BASE}/alerts/)", "alertService.dismissAlert(alert.product_id)")
    ]
)

# 3. Header
process_file(
    os.path.join(src_dir, 'components', 'Header.jsx'),
    "import * as alertService from '../services/alertService';\nimport * as searchService from '../services/searchService';",
    [
        ("axios.get(${API_BASE}/alerts/)", "alertService.getAlerts()"),
        ("axios.get(${API_BASE}/search/?q=)", "searchService.globalSearch(search)")
    ]
)

# 4. AnalyticsPage
process_file(
    os.path.join(src_dir, 'pages', 'AnalyticsPage.jsx'),
    "import * as dashboardService from '../services/dashboardService';",
    [
        ("axios.get(${API_BASE}/dashboard/stats)", "dashboardService.getStats()")
    ]
)

# 5. DashboardPage
process_file(
    os.path.join(src_dir, 'pages', 'DashboardPage.jsx'),
    "import * as dashboardService from '../services/dashboardService';",
    [
        ("axios.get(${API_BASE}/dashboard/stats)", "dashboardService.getStats()")
    ]
)

# 6. ProductsPage
process_file(
    os.path.join(src_dir, 'pages', 'ProductsPage.jsx'),
    "import * as productService from '../services/productService';\nimport * as supplierService from '../services/supplierService';",
    [
        ("axios.get(${API_BASE}/products/)", "productService.getProducts()"),
        ("axios.get(${API_BASE}/suppliers/)", "supplierService.getSuppliers()"),
        ("axios.put(${API_BASE}/products/, payload)", "productService.updateProduct(editItem.id, payload)"),
        ("axios.post(${API_BASE}/products/, payload)", "productService.createProduct(payload)"),
        ("axios.delete(${API_BASE}/products/)", "productService.deleteProduct(id)")
    ]
)

# 7. PurchaseHistoryPage
process_file(
    os.path.join(src_dir, 'pages', 'PurchaseHistoryPage.jsx'),
    "import * as purchaseHistoryService from '../services/purchaseHistoryService';\nimport * as productService from '../services/productService';\nimport * as supplierService from '../services/supplierService';",
    [
        ("axios.get(${API_BASE}/purchase-history/)", "purchaseHistoryService.getPurchaseHistory()"),
        ("axios.get(${API_BASE}/products/)", "productService.getProducts()"),
        ("axios.get(${API_BASE}/suppliers/)", "supplierService.getSuppliers()"),
        ("axios.post(${API_BASE}/purchase-history/, payload)", "purchaseHistoryService.createPurchaseHistory(payload)")
    ]
)

# 8. ResetPasswordPage
process_file(
    os.path.join(src_dir, 'pages', 'ResetPasswordPage.jsx'),
    "import * as authService from '../services/authService';",
    [
        ("axios.post(${API_BASE}/auth/reset-password/confirm, { token, new_password: password })", "authService.resetPasswordConfirm({ token, new_password: password })"),
        ("axios.post(${API_BASE}/auth/reset-password, { email: email.trim().toLowerCase() })", "authService.resetPassword({ email: email.trim().toLowerCase() })")
    ]
)

# 9. SuppliersPage
process_file(
    os.path.join(src_dir, 'pages', 'SuppliersPage.jsx'),
    "import * as supplierService from '../services/supplierService';",
    [
        ("axios.get(${API_BASE}/suppliers/)", "supplierService.getSuppliers()"),
        ("axios.put(${API_BASE}/suppliers/, form)", "supplierService.updateSupplier(editItem.id, form)"),
        ("axios.post(${API_BASE}/suppliers/, form)", "supplierService.createSupplier(form)"),
        ("axios.delete(${API_BASE}/suppliers/)", "supplierService.deleteSupplier(id)")
    ]
)

print('Done refactoring frontend!')
