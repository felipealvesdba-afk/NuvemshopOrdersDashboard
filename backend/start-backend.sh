#!/bin/bash

echo "Starting Nuvem Flow Dashboard Backend..."
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found"
    echo "Please run this script from the backend directory"
    exit 1
fi

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "WARNING: .env file not found"
    echo "Please create .env file based on env.example"
    echo
fi

# Check if serviceAccountKey.json exists
if [ ! -f "serviceAccountKey.json" ]; then
    echo "WARNING: serviceAccountKey.json not found"
    echo "Firebase features will not be available"
    echo "Please add your Firebase service account key file"
    echo
fi

echo "Starting backend server..."
echo "Backend will be available at: http://localhost:4000"
echo "Press Ctrl+C to stop the server"
echo

npm start
