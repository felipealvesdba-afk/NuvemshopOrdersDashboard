@echo off
echo Starting Nuvem Flow Dashboard Backend...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist package.json (
    echo ERROR: package.json not found
    echo Please run this script from the backend directory
    pause
    exit /b 1
)

REM Check if node_modules exists, if not install dependencies
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if .env file exists
if not exist .env (
    echo WARNING: .env file not found
    echo Please create .env file based on env.example
    echo.
)

REM Check if serviceAccountKey.json exists
if not exist serviceAccountKey.json (
    echo WARNING: serviceAccountKey.json not found
    echo Firebase features will not be available
    echo Please add your Firebase service account key file
    echo.
)

echo Starting backend server...
echo Backend will be available at: http://localhost:4000
echo Press Ctrl+C to stop the server
echo.

npm start

pause
