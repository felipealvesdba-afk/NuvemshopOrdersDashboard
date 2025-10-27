// Load environment variables (ignore errors if .env doesn't exist)
try {
  require('dotenv').config();
} catch (error) {
  console.warn('dotenv config failed, using environment variables from system');
}

const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const firebaseRoutes = require('./routes/firebase');
const refreshScheduler = require('./cron/refreshOrders');
const firestoreService = require('./services/firestore');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`${timestamp} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Middleware to ensure all responses are JSON
app.use((req, res, next) => {
  // Store original json method
  const originalJson = res.json;
  
  // Override json method to always ensure JSON response
  res.json = function(data) {
    res.setHeader('Content-Type', 'application/json');
    return originalJson.call(this, data);
  };
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API status endpoint
app.get('/api/status', async (req, res) => {
  try {
    const schedulerStatus = refreshScheduler.getStatus();
    const firestoreTest = await firestoreService.testConnection();
    
    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      services: {
        scheduler: schedulerStatus,
        firestore: firestoreTest
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        port: PORT,
        storeId: process.env.STORE_ID ? 'configured' : 'missing',
        nuvemshopToken: process.env.NUVEMSHOP_TOKEN ? 'configured' : 'missing',
        firebaseProject: 'nuvem-flow (serviceAccountKey.json)'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Manual refresh endpoint (for testing)
app.post('/api/refresh', async (req, res) => {
  try {
    await refreshScheduler.forceRefresh();
    res.json({
      success: true,
      message: 'Orders refreshed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to refresh orders',
      message: error.message
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/firebase', firebaseRoutes);
app.use('/api/orders', orderRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  console.error('Error stack:', error.stack);
  
  // Make sure we always send JSON, even if an error occurred
  try {
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' || process.env.VERCEL ? error.message : 'Something went wrong'
      });
    }
  } catch (e) {
    // Last resort - log and send plain text as JSON
    console.error('Critical: Could not send JSON error response:', e);
    res.type('json');
    res.status(500).send(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    }));
  }
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  refreshScheduler.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  refreshScheduler.stop();
  process.exit(0);
});

// Start server (only for local development)
async function startServer() {
  // Check if running in Vercel serverless environment
  if (process.env.VERCEL) {
    console.log('Running in Vercel serverless environment');
    firestoreService.initialize();
    return app;
  }

  // Local development only
  try {
    // Validate required environment variables
    const requiredEnvVars = [
      'STORE_ID',
      'NUVEMSHOP_TOKEN'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars.join(', '));
      console.error('Please check your .env file and ensure all required variables are set.');
      process.exit(1);
    }

    // Check for Firebase service account key file (only for local dev)
    const fs = require('fs');
    const path = require('path');
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath) && !process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      console.warn('Firebase service account key file not found!');
      console.warn('Continuing without Firebase (notes will not persist)');
    }

    // Initialize Firestore
    console.log('Initializing Firestore service...');
    firestoreService.initialize();

    // Start the order refresh scheduler
    console.log('Starting order refresh scheduler...');
    refreshScheduler.start();

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server only if not in serverless environment
if (process.env.VERCEL) {
  // For Vercel, just initialize and return app
  try {
    firestoreService.initialize();
  } catch (error) {
    console.error('Firestore initialization error in Vercel:', error.message);
    // Continue without Firebase - app will work with fallback
  }
} else {
  // For local development
  startServer();
}

module.exports = app;
