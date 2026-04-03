import os

routers_dir = r"C:\Users\User\Downloads\inventix (1)\inventix\backend\app\routers"
files_to_fix = ['suppliers.py', 'products.py', 'orders.py', 'inventory.py', 'alerts.py']

for f in files_to_fix:
    path = os.path.join(routers_dir, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Common replacements
    content = content.replace("from .. import models, schemas, database, auth", "from ..core import database, auth\nfrom .. import models, schemas")
    content = content.replace("from .. import auth, database, models, schemas", "from ..core import database, auth\nfrom .. import models, schemas")
    
    # Services
    if "from ..email_service" in content:
        content = content.replace("from ..email_service", "from ..services.email_service")
        
    with open(path, 'w', encoding='utf-8') as file:
        file.write(content)

# Fix auth.py
auth_path = os.path.join(routers_dir, "auth.py")
with open(auth_path, 'r', encoding='utf-8') as file:
    content = file.read()
if "from ..email_service" in content:
    content = content.replace("from ..email_service", "from ..services.email_service")
with open(auth_path, 'w', encoding='utf-8') as file:
    file.write(content)

