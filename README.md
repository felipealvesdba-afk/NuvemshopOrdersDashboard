# Nuvem Flow Dashboard

A comprehensive full-stack application for managing and monitoring Nuvemshop orders with delay tracking, note management, and user authentication.

## 🚀 Features

### Order Management
- **Real-time Order Sync**: Automatic synchronization with Nuvemshop API every 15 minutes
- **Delay Detection**: Automatic detection of orders delayed more than 3 days
- **Order Filtering**: Filter by status, search by customer name or order ID
- **Attention System**: Mark orders that need special attention

### Note Management
- **Firebase Integration**: Persistent note storage with Firebase Firestore
- **Rich Note Editing**: Add, edit, and delete notes for individual orders
- **Real-time Updates**: Notes sync across all sessions

### User Authentication
- **Secure Login System**: JWT-based authentication with Firebase backend
- **User Registration**: Create new accounts with role-based access
- **Profile Management**: Update profiles, change passwords, delete accounts
- **Persistent Sessions**: User data persists across server restarts

### Modern UI/UX
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Mode**: Built-in theme switching
- **Real-time Notifications**: Toast notifications for all actions
- **Intuitive Interface**: Clean, modern design with excellent UX

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **React Router** for navigation
- **React Query** for data fetching and caching
- **Sonner** for notifications

### Backend
- **Node.js** with Express.js
- **Firebase Firestore** for data persistence
- **Nuvemshop API** integration
- **JWT** authentication
- **Cron jobs** for automated order synchronization
- **CORS** enabled for frontend integration

## 📋 Prerequisites

- Node.js 18+ 
- Firebase project with Firestore enabled
- Nuvemshop API credentials
- Git

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd nuvem-flow-dash-main
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp env.example .env

# Edit .env with your configuration
# Required variables:
# - STORE_ID=your_nuvemshop_store_id
# - NUVEMSHOP_TOKEN=your_nuvemshop_access_token
# - PORT=4000 (optional)
# - NODE_ENV=development

# Place Firebase service account key
# Copy your Firebase service account key as: serviceAccountKey.json
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### 4. Firebase Configuration
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Generate a service account key
4. Download and place as `backend/serviceAccountKey.json`

### 5. Start Development Servers
```bash
# Terminal 1 - Backend (from backend directory)
npm start

# Terminal 2 - Frontend (from frontend directory)
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:4000

## 🔐 Authentication

### Demo Credentials
- **Email**: `demo@nuvemshop.com`
- **Password**: `demo123`

### User Roles
- **Admin**: Full access to all features
- **Manager**: Order management and note editing
- **User**: Basic order viewing and note editing

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify authentication token
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password
- `DELETE /api/auth/account` - Delete user account

### Order Management
- `GET /api/orders` - Get all orders with computed fields
- `GET /api/orders/:id` - Get specific order details
- `POST /api/orders/:id/note` - Save/update order note
- `DELETE /api/orders/:id/note` - Delete order note

### System Health
- `GET /health` - Basic health check
- `GET /api/status` - Detailed system status
- `GET /api/firebase/test` - Test Firebase connection

## 🏗️ Project Structure

```
nuvem-flow-dash-main/
├── backend/
│   ├── routes/              # API route handlers
│   │   ├── auth.js         # Authentication routes
│   │   ├── orders.js       # Order management routes
│   │   └── firebase.js     # Firebase testing routes
│   ├── services/           # Business logic services
│   │   ├── nuvemshop.js    # Nuvemshop API integration
│   │   ├── firestore.js    # Firebase Firestore operations
│   │   └── userService.js  # User management service
│   ├── cron/              # Scheduled tasks
│   │   └── refreshOrders.js
│   ├── server.js          # Main server file
│   ├── package.json
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   │   ├── ui/        # Base UI components
│   │   │   ├── OrderTable.tsx
│   │   │   ├── OrderRow.tsx
│   │   │   └── ...
│   │   ├── pages/         # Page components
│   │   │   ├── Index.tsx  # Main dashboard
│   │   │   ├── Login.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── ...
│   │   ├── contexts/      # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   ├── package.json
│   └── README.md
├── .gitignore
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Nuvemshop API Configuration
STORE_ID=your_store_id_here
NUVEMSHOP_TOKEN=your_nuvemshop_access_token_here

# Server Configuration
PORT=4000
NODE_ENV=development
CACHE_DURATION=15
```

#### Frontend (vite.config.ts)
```typescript
// API URL configuration
VITE_API_URL=http://localhost:4000
```

### Firebase Setup
1. Create Firebase project
2. Enable Firestore Database
3. Generate service account key
4. Place as `backend/serviceAccountKey.json`

### Nuvemshop API Setup
1. Get API credentials from Nuvemshop dashboard
2. Configure `STORE_ID` and `NUVEMSHOP_TOKEN` in backend `.env`

## 🚀 Deployment

### Backend Deployment
The backend can be deployed to:
- **Vercel**: Use Vercel CLI or connect GitHub repo
- **Firebase Functions**: Deploy as Cloud Function
- **Render**: Simple deployment with environment variables
- **Railway**: Simple deployment with environment variables

### Frontend Deployment
The frontend can be deployed to:
- **Vercel**: Automatic deployment from GitHub
- **Netlify**: Connect GitHub repo for automatic builds
- **Firebase Hosting**: Deploy with Firebase CLI

### Production Environment Variables
Ensure these are set in your deployment platform:
- `STORE_ID`
- `NUVEMSHOP_TOKEN`
- `PORT` (optional, defaults to 4000)
- `NODE_ENV=production`

## 🧪 Testing

### Manual Testing
1. **Authentication**: Test login, registration, profile updates
2. **Order Management**: Verify order fetching and filtering
3. **Note System**: Test note creation, editing, and deletion
4. **Firebase Integration**: Verify data persistence

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@nuvemshop.com","password":"demo123"}'

# Test order fetching
curl -X GET http://localhost:4000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 Monitoring

### Health Checks
- `GET /health` - Basic health check for load balancers
- `GET /api/status` - Detailed system status and health

### Logging
- Comprehensive error logging
- Request/response logging in development
- Performance metrics and cache statistics

## 🛡️ Security

- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: All inputs validated and sanitized
- **CORS Configuration**: Properly configured for frontend integration
- **Environment Variables**: Sensitive data stored in environment variables
- **Firebase Security**: Firestore security rules for data protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues or questions:
1. Check the logs for detailed error messages
2. Verify environment variables are correctly set
3. Test Nuvemshop API connectivity
4. Verify Firebase credentials and permissions
5. Check the [Issues](https://github.com/your-repo/issues) page

## 🙏 Acknowledgments

- [Nuvemshop](https://www.nuvemshop.com.br/) for the e-commerce API
- [Firebase](https://firebase.google.com/) for backend services
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
