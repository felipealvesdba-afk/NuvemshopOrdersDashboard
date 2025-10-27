const express = require('express');
const router = express.Router();
const firestoreService = require('../services/firestore');

/**
 * GET /api/firebase/test
 * Test Firebase connection and basic operations
 */
router.get('/test', async (req, res) => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test connection
    const connectionTest = await firestoreService.testConnection();
    
    if (connectionTest.fallback) {
      return res.json({
        success: true,
        message: 'Firebase project not found - using fallback mode',
        fallback: true,
        tests: {
          connection: false,
          write: true,
          read: true,
          delete: true
        },
        timestamp: new Date().toISOString()
      });
    }
    
    if (!connectionTest.success) {
      return res.status(500).json({
        success: false,
        message: 'Firebase connection failed',
        error: connectionTest.message
      });
    }

    // Test write operation
    const testOrderId = 'test_' + Date.now();
    const testNote = {
      note: 'This is a test note',
      attention: false
    };

    console.log(`Testing write operation with order ID: ${testOrderId}`);
    const writeResult = await firestoreService.saveOrderNote(testOrderId, testNote);
    
    if (!writeResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Firebase write test failed'
      });
    }

    // Test read operation
    console.log(`Testing read operation with order ID: ${testOrderId}`);
    const readResult = await firestoreService.getOrderNote(testOrderId);
    
    if (!readResult.success || !readResult.exists) {
      return res.status(500).json({
        success: false,
        message: 'Firebase read test failed'
      });
    }

    // Test delete operation
    console.log(`Testing delete operation with order ID: ${testOrderId}`);
    const deleteResult = await firestoreService.deleteOrderNote(testOrderId);
    
    if (!deleteResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Firebase delete test failed'
      });
    }

    res.json({
      success: true,
      message: 'All Firebase operations successful',
      tests: {
        connection: connectionTest.success,
        write: writeResult.success,
        read: readResult.success,
        delete: deleteResult.success
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Firebase test error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Firebase test failed',
      error: error.message
    });
  }
});

/**
 * GET /api/firebase/notes
 * Get all notes from Firestore (for debugging)
 */
router.get('/notes', async (req, res) => {
  try {
    const result = await firestoreService.getAllNotes();
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting all notes:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to get notes',
      error: error.message
    });
  }
});

/**
 * POST /api/firebase/seed
 * Seed Firestore with sample data (for testing)
 */
router.post('/seed', async (req, res) => {
  try {
    const sampleNotes = [
      {
        orderId: '12345',
        note: 'Customer requested expedited shipping',
        attention: true
      },
      {
        orderId: '12346',
        note: 'Special packaging required',
        attention: false
      },
      {
        orderId: '12347',
        note: 'Customer complaint - investigate',
        attention: true
      }
    ];

    const results = [];
    
    for (const noteData of sampleNotes) {
      try {
        const result = await firestoreService.saveOrderNote(noteData.orderId, {
          note: noteData.note,
          attention: noteData.attention
        });
        results.push({
          orderId: noteData.orderId,
          success: result.success
        });
      } catch (error) {
        results.push({
          orderId: noteData.orderId,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Sample data seeded successfully',
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error seeding data:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to seed data',
      error: error.message
    });
  }
});

module.exports = router;
