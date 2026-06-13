@echo off
echo Starting Blood Donation Management System...

start "Backend - FastAPI" cmd /k "python -m uvicorn api:app --reload --port 8000"

timeout /t 2 /nobreak >nul

start "Frontend - React" cmd /k "cd frontend && npm run dev"

echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Both servers are starting in separate windows.
