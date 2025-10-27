// Vercel serverless function entry point
// This file ensures the Express app loads safely and all errors are returned as JSON

// Create a safe error handler for initialization errors
function createErrorHandler(res) {
  return (error) => {
    console.error('Unhandled promise rejection:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An unexpected error occurred'
      });
    }
  };
}

// Wrap everything in try-catch to ensure we always return JSON
try {
  // Load the Express app
  let app;
  try {
    app = require('../backend/server');
  } catch (requireError) {
    console.error('Critical: Failed to load backend server:', requireError);
    
    // Create minimal Express app as fallback
    const express = require('express');
    app = express();
    
    // Add JSON parsing middleware
    app.use(express.json());
    
    // Add CORS
    app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
      }
      next();
    });
    
    // Handle all routes
    app.use('*', (req, res) => {
      res.status(500).json({
        success: false,
        error: 'Server initialization error',
        message: 'Backend server failed to load. Please check server logs.',
        details: process.env.NODE_ENV === 'production' ? undefined : requireError.message
      });
    });
  }
  
  // Export the app
  module.exports = app;
  
} catch (initError) {
  console.error('Critical: Failed to initialize serverless function:', initError);
  
  // Last resort - export a minimal handler
  const express = require('express');
  const fallbackApp = express();
  
  fallbackApp.use(express.json());
  fallbackApp.use((req, res) => {
    res.status(500).json({
      success: false,
      error: 'Critical initialization failure',
      message: 'Unable to start server. Please contact support.',
      details: process.env.NODE_ENV === 'development' ? initError.message : undefined
    });
  });
  
  module.exports = fallbackApp;
}
