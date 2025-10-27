// Vercel serverless function entry point

// Handle errors during module loading
let app;
try {
  app = require('../backend/server');
} catch (error) {
  console.error('Error loading backend server:', error);
  
  // Create a minimal Express app to handle errors
  const express = require('express');
  app = express();
  
  app.use((req, res, next) => {
    res.status(500).json({
      success: false,
      error: 'Server initialization error',
      message: error.message
    });
  });
}

// Export the app directly for Vercel
// Express apps work directly with Vercel serverless functions
module.exports = app;

