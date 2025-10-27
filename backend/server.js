require('dotenv').config();
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
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
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

// Start server
async function startServer() {
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

    // Check for Firebase service account key file
    const fs = require('fs');
    const path = require('path');
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('Firebase service account key file not found!');
      console.error('Please place your serviceAccountKey.json file in the backend root directory.');
      process.exit(1);
    }

    // Initialize Firestore
    console.log('Initializing Firestore service...');
    firestoreService.initialize();

    // Start the order refresh scheduler
    console.log('Starting order refresh scheduler...');
    refreshScheduler.start();

    // Start the server
    app.listen(PORT, () => {
      
    });

  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
