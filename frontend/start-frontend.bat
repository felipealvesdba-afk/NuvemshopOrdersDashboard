@echo off
echo Starting Nuvem Flow Dashboard Frontend...
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
    echo Please run this script from the frontend directory
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
    echo Please create .env file with VITE_API_URL=http://localhost:4000
    echo.
)

echo Starting frontend development server...
echo Frontend will be available at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

npm start

pause
