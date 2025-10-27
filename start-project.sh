#!/bin/bash

echo "Starting Nuvem Flow Dashboard - Full Project..."
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

# Make shell scripts executable
chmod +x backend/start-backend.sh
chmod +x frontend/start-frontend.sh

echo "Starting Backend Server..."
gnome-terminal --title="Backend Server" -- bash -c "cd backend && ./start-backend.sh; exec bash" 2>/dev/null || \
xterm -title "Backend Server" -e "cd backend && ./start-backend.sh; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd backend && ./start-backend.sh"' 2>/dev/null || \
echo "Please start backend manually: cd backend && ./start-backend.sh"

# Wait a moment for backend to start
sleep 3

echo "Starting Frontend Server..."
gnome-terminal --title="Frontend Server" -- bash -c "cd frontend && ./start-frontend.sh; exec bash" 2>/dev/null || \
xterm -title "Frontend Server" -e "cd frontend && ./start-frontend.sh; exec bash" 2>/dev/null || \
osascript -e 'tell app "Terminal" to do script "cd frontend && ./start-frontend.sh"' 2>/dev/null || \
echo "Please start frontend manually: cd frontend && ./start-frontend.sh"

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:5173"
echo
echo "Press Ctrl+C to stop this script (servers will continue running)"
echo "Or close the terminal windows to stop the servers"
