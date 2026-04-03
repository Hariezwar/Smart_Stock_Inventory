@echo off
cd /d "%~dp0"

if not exist ".\venv\Scripts\python.exe" (
  echo Backend virtual environment was not found at .\venv\Scripts\python.exe
  pause
  exit /b 1
)

echo Starting Inventix backend on http://127.0.0.1:8000
echo Keep this window open while using the app.
echo.

.\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
