import os
import re

routers_dir = r"C:\Users\User\Downloads\inventix (1)\inventix\backend\app\routers"

for f in os.listdir(routers_dir):
    if f.endswith('.py'):
        path = os.path.join(routers_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace the specific large compound import
        content = content.replace("from .. import auth, config, database, models, schemas", "from ..core import auth, config, database\nfrom .. import models, schemas")
        # Replace other compounds
        content = content.replace("from .. import models, database, auth", "from ..core import database, auth\nfrom .. import models")
        content = content.replace("from .. import models, database", "from ..core import database\nfrom .. import models")
        content = content.replace("from .. import schemas, models, auth, config", "from ..core import auth, config\nfrom .. import schemas, models")
        
        with open(path, 'w', encoding='utf-8') as file:
            file.write(content)

# Fix core/auth.py
auth_path = r"C:\Users\User\Downloads\inventix (1)\inventix\backend\app\core\auth.py"
with open(auth_path, 'r') as file:
    content = file.read()
content = content.replace("from . import config, database, models", "from . import config, database\nfrom .. import models")
content = content.replace("from . import config", "from . import config")
with open(auth_path, 'w') as file:
    file.write(content)

# Fix email_service.py
email_path = r"C:\Users\User\Downloads\inventix (1)\inventix\backend\app\services\email_service.py"
with open(email_path, 'r') as file:
    content = file.read()
content = content.replace("from . import config", "from ..core import config")
with open(email_path, 'w') as file:
    file.write(content)

# Fix database.py
db_path = r"C:\Users\User\Downloads\inventix (1)\inventix\backend\app\core\database.py"
with open(db_path, 'r') as file:
    content = file.read()
content = content.replace("from . import config", "from . import config")
with open(db_path, 'w') as file:
    file.write(content)

