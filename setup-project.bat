@echo off
echo Nuvem Flow Dashboard - Project Setup
echo ====================================
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

echo Setting up Nuvem Flow Dashboard...
echo.

echo 1. Installing Backend Dependencies...
cd backend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
) else (
    echo Backend dependencies already installed
)
cd ..

echo.
echo 2. Installing Frontend Dependencies...
cd frontend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed
)
cd ..

echo.
echo 3. Checking Configuration Files...

REM Check backend .env
if not exist "backend\.env" (
    echo WARNING: backend\.env not found
    echo Please copy backend\env.example to backend\.env and configure it
) else (
    echo Backend .env file found
)

REM Check Firebase key
if not exist "backend\serviceAccountKey.json" (
    echo WARNING: backend\serviceAccountKey.json not found
    echo Firebase features will not be available
    echo Please add your Firebase service account key file
) else (
    echo Firebase service account key found
)

REM Check frontend .env
if not exist "frontend\.env" (
    echo WARNING: frontend\.env not found
    echo Creating frontend\.env with default values...
    echo VITE_API_URL=http://localhost:4000 > frontend\.env
) else (
    echo Frontend .env file found
)

echo.
echo Setup Complete!
echo.
echo To start the project:
echo - Windows: Double-click start-project.bat
echo - Mac/Linux: Run ./start-project.sh
echo.
echo Or start individually:
echo - Backend: Double-click backend\start-backend.bat (Windows) or ./backend/start-backend.sh (Mac/Linux)
echo - Frontend: Double-click frontend\start-frontend.bat (Windows) or ./frontend/start-frontend.sh (Mac/Linux)
echo.
pause
