# Nuvem Flow Dashboard - Startup Scripts

This project includes convenient startup scripts for both Windows and Mac/Linux systems.

## Quick Start

### Option 1: Full Project Setup (Recommended for first time)
```bash
# Windows
setup-project.bat

# Mac/Linux
chmod +x setup-project.sh
./setup-project.sh
```

### Option 2: Start Everything at Once
```bash
# Windows
start-project.bat

# Mac/Linux
chmod +x start-project.sh
./start-project.sh
```

### Option 3: Start Backend and Frontend Separately

#### Backend Only
```bash
# Windows
cd backend
start-backend.bat

# Mac/Linux
cd backend
chmod +x start-backend.sh
./start-backend.sh
```

#### Frontend Only
```bash
# Windows
cd frontend
start-frontend.bat

# Mac/Linux
cd frontend
chmod +x start-frontend.sh
./start-frontend.sh
```

## What Each Script Does

### Setup Scripts (`setup-project.*`)
- Installs backend and frontend dependencies
- Checks for required configuration files
- Creates default frontend `.env` file
- Provides setup status and next steps

### Startup Scripts (`start-project.*`)
- Starts both backend and frontend servers
- Opens separate terminal windows for each server
- Backend runs on: http://localhost:4000
- Frontend runs on: http://localhost:5173

### Individual Server Scripts (`start-backend.*`, `start-frontend.*`)
- Check for Node.js and npm installation
- Verify required files exist
- Install dependencies if needed
- Start the respective server
- Provide helpful error messages and warnings

## Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

## Configuration Files

### Backend Configuration
- `backend/.env` - Copy from `backend/env.example` and configure
- `backend/serviceAccountKey.json` - Firebase service account key (optional)

### Frontend Configuration
- `frontend/.env` - Created automatically with `VITE_API_URL=http://localhost:4000`

## Troubleshooting

### Common Issues

1. **"Node.js is not installed"**
   - Install Node.js from https://nodejs.org/

2. **"package.json not found"**
   - Make sure you're running scripts from the correct directory

3. **"Firebase features not available"**
   - Add `serviceAccountKey.json` to the backend directory
   - Or ignore this warning if Firebase is not needed

4. **Port already in use**
   - Stop other applications using ports 4000 or 5173
   - Or change ports in configuration files

### Manual Commands

If scripts don't work, you can run commands manually:

```bash
# Backend
cd backend
npm install
npm start

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

## File Structure

```
nuvem-flow-dash-main/
├── start-project.bat          # Windows: Start both servers
├── start-project.sh           # Mac/Linux: Start both servers
├── setup-project.bat          # Windows: Initial setup
├── setup-project.sh           # Mac/Linux: Initial setup
├── backend/
│   ├── start-backend.bat      # Windows: Start backend only
│   └── start-backend.sh       # Mac/Linux: Start backend only
└── frontend/
    ├── start-frontend.bat     # Windows: Start frontend only
    └── start-frontend.sh      # Mac/Linux: Start frontend only
```

## Support

If you encounter issues:
1. Check the error messages in the terminal
2. Verify all prerequisites are installed
3. Ensure configuration files are properly set up
4. Try running commands manually to isolate the issue
