@echo off
echo Starting Nuvem Flow Dashboard - Full Project...
echo.

REM Check if we're in the project root
if not exist "backend\package.json" (
    echo ERROR: backend\package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ERROR: frontend\package.json not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && start-backend.bat"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && start-frontend.bat"

echo.
echo Both servers are starting...
echo Backend: http://localhost:4000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window (servers will continue running)
pause >nul
