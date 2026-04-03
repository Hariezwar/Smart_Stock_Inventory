import os

routers_dir = r"C:\Users\User\Downloads\inventix (1)\inventix\backend\app\routers"
app_dir = r"C:\Users\User\Downloads\inventix (1)\inventix\backend\app"

# Fix routers
for f in os.listdir(routers_dir):
    if f.endswith('.py'):
        path = os.path.join(routers_dir, f)
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Replace old imports
        content = content.replace("from .. import auth", "from ..core import auth")
        content = content.replace("from .. import database", "from ..core import database")
        content = content.replace("from .. import config", "from ..core import config")
        
        # Handle compound imports: from .. import auth, config, database, models, schemas
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if line.startswith("from .. import") or line.startswith("from . import"): 
                # Let's just catch the standard compound ones. Actually, all of them can be converted properly.
                pass
        
with open(os.path.join(app_dir, 'main.py'), 'r', encoding='utf-8') as file:
    main_content = file.read()
main_content = main_content.replace('from . import models, database', 'from . import models\nfrom .core import database')
main_content = main_content.replace('from .routers import', 'from .routers import')
main_content = main_content.replace('from .seed import seed', 'from .seed import seed')
with open(os.path.join(app_dir, 'main.py'), 'w', encoding='utf-8') as file:
    file.write(main_content)

