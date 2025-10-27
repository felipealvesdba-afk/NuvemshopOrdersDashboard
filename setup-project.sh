#!/bin/bash

echo "Nuvem Flow Dashboard - Project Setup"
echo "===================================="
echo

# Check if we're in the project root
if [ ! -f "backend/package.json" ]; then
    echo "ERROR: backend/package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

if [ ! -f "frontend/package.json" ]; then
    echo "ERROR: frontend/package.json not found"
    echo "Please run this script from the project root directory"
    exit 1
fi

echo "Setting up Nuvem Flow Dashboard..."
echo

echo "1. Installing Backend Dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install backend dependencies"
        exit 1
    fi
else
    echo "Backend dependencies already installed"
fi
cd ..

echo
echo "2. Installing Frontend Dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install frontend dependencies"
        exit 1
    fi
else
    echo "Frontend dependencies already installed"
fi
cd ..

echo
echo "3. Checking Configuration Files..."

# Check backend .env
if [ ! -f "backend/.env" ]; then
    echo "WARNING: backend/.env not found"
    echo "Please copy backend/env.example to backend/.env and configure it"
else
    echo "Backend .env file found"
fi

# Check Firebase key
if [ ! -f "backend/serviceAccountKey.json" ]; then
    echo "WARNING: backend/serviceAccountKey.json not found"
    echo "Firebase features will not be available"
    echo "Please add your Firebase service account key file"
else
    echo "Firebase service account key found"
fi

# Check frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "WARNING: frontend/.env not found"
    echo "Creating frontend/.env with default values..."
    echo "VITE_API_URL=http://localhost:4000" > frontend/.env
else
    echo "Frontend .env file found"
fi

echo
echo "Setup Complete!"
echo
echo "To start the project:"
echo "- Run ./start-project.sh"
echo
echo "Or start individually:"
echo "- Backend: ./backend/start-backend.sh"
echo "- Frontend: ./frontend/start-frontend.sh"
echo
