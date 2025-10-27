# Nuvem Flow Backend

A lightweight Node.js + Express backend that integrates with the Nuvemshop API and provides endpoints for a custom dashboard that tracks and manages store orders.

## Features

- 🔄 **Automatic Order Sync**: Fetches orders from Nuvemshop API every 10-15 minutes
- 📝 **Order Notes**: Save and manage manual notes for orders using Firebase Firestore
- ⚠️ **Delay Detection**: Automatically detects orders delayed more than 3 days in "ready_to_pack" status
- 🚀 **Caching**: In-memory caching to reduce API calls and improve performance
- 🔧 **RESTful API**: Clean endpoints for frontend integration
- 📊 **Health Monitoring**: Built-in health checks and status endpoints

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your credentials:

```bash
cp env.example .env
```

Edit `.env` with your actual values:

```env
# Nuvemshop API Configuration
STORE_ID=your_store_id_here
NUVEMSHOP_TOKEN=your_nuvemshop_access_token_here

# Firebase Configuration
# Note: Firebase credentials are loaded from serviceAccountKey.json
# Place your Firebase service account key file in the backend root directory

# Server Configuration
PORT=4000
NODE_ENV=development
CACHE_DURATION=15
```

### 3. Firebase Setup

Place your Firebase service account key file in the backend root directory:

```bash
# Your Firebase service account key should be named:
backend/serviceAccountKey.json
```

The file should contain your Firebase project credentials in JSON format.

### 4. Run the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4000`

## API Endpoints

### Health & Status

- `GET /health` - Basic health check
- `GET /api/status` - Detailed API status and service health
- `POST /api/refresh` - Manually trigger order refresh

### Authentication

- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify authentication token
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - User registration

### Firebase Testing

- `GET /api/firebase/test` - Test Firebase connection and operations
- `GET /api/firebase/notes` - Get all notes from Firestore
- `POST /api/firebase/seed` - Seed sample data for testing

### Orders

- `GET /api/orders` - Get all orders with computed fields
- `GET /api/orders/:id` - Get single order details
- `GET /api/orders/attention` - Get orders marked as needing attention

### Order Notes

- `GET /api/orders/:id/note` - Get note for specific order
- `POST /api/orders/:id/note` - Save/update note for order
- `DELETE /api/orders/:id/note` - Delete note for order

## Order Data Structure

Each order includes:

```json
{
  "id": 12345,
  "customer_name": "John Doe",
  "order_date": "2024-01-15T10:30:00Z",
  "status": "ready_to_pack",
  "days_in_ready_to_pack": 2,
  "is_delayed": false,
  "note": "Customer requested exchange",
  "attention": true
}
```

## Nuvemshop Integration

The backend integrates with Nuvemshop API using:

- **Base URL**: `https://api.nuvemshop.com.br/v1/{store_id}`
- **Authentication**: `Authentication: bearer {access_token}` (Note: NOT "Authorization")
- **Order Statuses**: `ready_to_pack` and `sent`

## Firebase Firestore Structure

Notes are stored in Firestore with this structure:

```
Collection: notes
Document ID: {orderId}
Fields:
  - note: string
  - attention: boolean
  - updatedAt: timestamp
```

## Caching

- Orders are cached in memory for 10-15 minutes (configurable)
- Cache is automatically refreshed by cron job
- Manual cache clearing available via refresh endpoint

## Error Handling

- Comprehensive error logging
- Graceful error responses
- Automatic retry mechanisms for failed API calls

## Deployment

This backend is designed to be easily deployed on:

- **Vercel**: Use `vercel` CLI or connect GitHub repo
- **Firebase Functions**: Deploy as Cloud Function
- **Render**: Simple deployment with environment variables
- **Railway**: Simple deployment with environment variables

### Environment Variables for Production

Ensure these are set in your deployment platform:

- `STORE_ID`
- `NUVEMSHOP_TOKEN`
- `PORT` (optional, defaults to 4000)
- `NODE_ENV` (set to "production")

**Note**: Firebase credentials are loaded from `serviceAccountKey.json` file, not environment variables. Make sure to include this file in your deployment.

## Development

### Project Structure

```
backend/
├── server.js              # Main server file
├── routes/
│   └── orders.js          # Order-related endpoints
├── services/
│   ├── nuvemshop.js       # Nuvemshop API integration
│   └── firestore.js       # Firebase Firestore operations
├── cron/
│   └── refreshOrders.js   # Automatic order refresh
├── package.json
├── env.example
└── README.md
```

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

## Monitoring

The backend includes built-in monitoring:

- Health check endpoint for load balancers
- Detailed status endpoint with service health
- Comprehensive logging for debugging
- Cache statistics and performance metrics

## Security

- Environment variables for sensitive data
- Input validation on all endpoints
- Error messages sanitized in production
- CORS enabled for frontend integration

## Support

For issues or questions:

1. Check the logs for detailed error messages
2. Verify environment variables are correctly set
3. Test Nuvemshop API connectivity
4. Verify Firebase credentials and permissions
