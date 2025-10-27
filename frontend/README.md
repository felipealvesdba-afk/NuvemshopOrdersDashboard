# Nuvem Flow Dashboard

A modern dashboard for managing and monitoring Nuvemshop orders with delay tracking, note management, and user authentication.

## Features

- **Order Management**: View and manage orders from your Nuvemshop store
- **Delay Tracking**: Monitor order delays and overdue orders
- **Note System**: Add, edit, and delete notes for orders with Firebase persistence
- **Attention Flags**: Mark orders that need special attention
- **User Authentication**: Secure login system with Firebase integration
- **Profile Management**: Update user profiles, change passwords, and manage accounts
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Radix UI components
- React Router for navigation
- React Query for data fetching
- Sonner for notifications

### Backend
- Node.js with Express
- Firebase Firestore for data persistence
- Nuvemshop API integration
- JWT authentication
- Cron jobs for order synchronization

## Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project with Firestore enabled
- Nuvemshop API credentials

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd nuvem-flow-dash-main
```

2. Install dependencies:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Configure environment variables:
```bash
# Copy backend environment template
cp backend/env.example backend/.env

# Edit backend/.env with your configuration:
# - Firebase service account key
# - Nuvemshop API credentials
# - Database settings
```

4. Start the development servers:
```bash
# Backend (from backend directory)
npm start

# Frontend (from frontend directory)
npm run dev
```

5. Access the application:
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000

## Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Firestore Database
3. Generate a service account key
4. Place the key file as `backend/serviceAccountKey.json`

### Nuvemshop API
1. Get your API credentials from Nuvemshop
2. Configure the API URL and credentials in `backend/.env`

## Usage

### Authentication
- Use demo credentials: `demo@nuvemshop.com` / `demo123`
- Or register a new account
- All user data is persisted in Firebase

### Order Management
- View orders with delay tracking
- Add notes to orders (saved to Firebase)
- Mark orders for attention
- Filter and search orders

### Profile Management
- Update your profile information
- Change your password
- Delete your account (with confirmation)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify token
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password
- `DELETE /api/auth/account` - Delete account

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get specific order
- `POST /api/orders/:id/note` - Save order note
- `DELETE /api/orders/:id/note` - Delete order note

### Firebase
- `GET /api/firebase/test` - Test Firebase connection
- `POST /api/firebase/seed` - Seed demo data

## Development

### Project Structure
```
├── backend/
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── cron/           # Scheduled tasks
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── contexts/   # React contexts
│   │   ├── hooks/      # Custom hooks
│   │   ├── services/   # API services
│   │   └── types/      # TypeScript types
│   └── public/         # Static assets
```

### Building for Production
```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.