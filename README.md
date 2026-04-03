Inventix

Inventix is a full-stack inventory management app built with:

    FastAPI + SQLAlchemy + SQLite on the backend
    React + Vite + Tailwind CSS on the frontend
    Chart.js for analytics visualizations

It includes authentication, supplier and product management, alerts, purchase history, profile settings, and an inventory chatbot.
Important Data Note

The live application data is stored in:

inventix/inventix.db

This file contains saved:

    user accounts
    products
    suppliers
    purchase history
    purchase orders

Do not delete or overwrite inventix.db if you want to keep existing data.
Project Structure

inventix/
├─ README.md
├─ inventix.db
├─ uploads/
│  └─ avatars/
├─ backend/
│  ├─ requirements.txt
│  ├─ uploads/
│  └─ app/
│     ├─ main.py
│     ├─ models.py
│     ├─ schemas.py
│     ├─ seed.py
│     ├─ core/
│     │  ├─ auth.py
│     │  ├─ config.py
│     │  └─ database.py
│     ├─ routers/
│     └─ services/
└─ frontend/
   ├─ package.json
   ├─ vite.config.js
   └─ src/
      ├─ components/
      ├─ context/
      ├─ pages/
      ├─ services/
      ├─ utils/
      ├─ App.jsx
      ├─ main.jsx
      └─ index.css

Features

    Dashboard with KPI cards and charts
    Product inventory management
    Supplier management
    Alerts and reorder actions
    Purchase history tracking
    Login, signup, password reset, and security question flow
    Profile editing and avatar uploads
    Search across products and suppliers
    Inventory chatbot

Prerequisites

    Python 3.9+
    Node.js 16+
    npm

Backend Setup

From the project root:

cd inventix
python -m venv venv
.\venv\Scripts\activate
pip install -r backend\requirements.txt

Start the backend:

$env:PYTHONPATH = (Get-Item .).FullName
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000

Backend URLs:

    API: http://127.0.0.1:8000
    Docs: http://127.0.0.1:8000/docs

Frontend Setup

Open a new terminal:

cd inventix\frontend
npm install
npm run dev

Frontend URL:

    App: http://127.0.0.1:5173

By default, the frontend calls:

http://127.0.0.1:8000

Environment Notes

Backend .env values can be placed in:

    backend/.env
    backend/app/.env if needed by local tooling

Useful backend environment variables:

    OPENAI_API_KEY
    SMTP_USER
    SMTP_PASSWORD
    FRONTEND_URL
    SECRET_KEY

Backend Architecture

The backend is organized as:

    routers/ for API endpoints
    services/ for business logic
    core/ for auth, config, and database setup
    models.py for SQLAlchemy models
    schemas.py for request/response validation

Current routed modules:

    auth
    products
    suppliers
    dashboard
    chatbot
    orders (/purchase-history)
    alerts
    search

Frontend Architecture

The frontend is organized as:

    components/ for reusable UI
    pages/ for route-level screens
    services/ for API access
    context/ for auth, theme, and toast state
    utils/ for small shared helpers

Main protected routes:

    /dashboard
    /products
    /suppliers
    /analytics
    /alerts
    /purchase-history
    /settings

Public routes:

    /login
    /signup
    /reset-password

Notes for Cleanup / Refactor Work

Safe cleanup targets usually include:

    __pycache__/
    old refactor helper scripts
    duplicate generated files that are no longer referenced

Do not remove these if you want to preserve behavior and data:

    inventix.db
    uploads/avatars/
    backend and frontend source files

Verification

Recommended checks after changes:

cd inventix\frontend
npm run build

cd inventix
.\venv\Scripts\python.exe -c "import backend.app.main; print('backend ok')"

