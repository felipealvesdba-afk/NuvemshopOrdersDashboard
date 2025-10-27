const express = require('express');
const router = express.Router();
const nuvemshopService = require('../services/nuvemshop');
const firestoreService = require('../services/firestore');

// Helper function to update counts in Firebase (non-blocking)
const updateCountsInFirebase = async () => {
  try {
    console.log('Updating counts in Firebase...');
    
    // Get unshipped orders count
    const unshippedResult = await nuvemshopService.fetchOrders(1, 1, 'unshipped');
    const unshippedCount = unshippedResult.totalCount || 0;
    
    // Get shipped orders count  
    const shippedResult = await nuvemshopService.fetchOrders(1, 1, 'shipped');
    const shippedCount = shippedResult.totalCount || 0;
    
    console.log(`Updating Firebase counts - Unshipped: ${unshippedCount}, Shipped: ${shippedCount}`);
    
    // Save counts to Firebase (non-blocking)
    const counts = { unshipped: unshippedCount, shipped: shippedCount };
    const saveResult = await firestoreService.saveOrderCounts(counts);
    
    if (!saveResult.success) {
      console.warn('Failed to save counts to Firebase (non-critical):', saveResult.message);
    } else {
      console.log('Counts updated in Firebase successfully');
    }
  } catch (error) {
    console.warn('Error updating counts in Firebase (non-critical):', error.message);
  }
};

// Helper function to calculate business days between two dates
const calculateBusinessDays = (startDate, endDate) => {
  let count = 0;
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0); // Normalize start date to beginning of day
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0); // Normalize end date to beginning of day

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};

/**
 * GET /api/orders
 * Returns paginated orders from Nuvemshop with computed fields
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 50;
    const searchTerm = req.query.search || '';
    const statusFilter = req.query.shipping_status || 'any';
    const overdueOnly = req.query.overdue_only === 'true';
    const attentionOnly = req.query.attention_only === 'true';
    
    console.log(`Fetching orders - Page: ${page}, Per Page: ${perPage}, Search: "${searchTerm}", Shipping Status: ${statusFilter}, Overdue: ${overdueOnly}, Attention: ${attentionOnly}`);
    
    // Fetch paginated orders from Nuvemshop with SHipping Status filter
    const result = await nuvemshopService.fetchOrders(page, perPage, statusFilter);
    
    // Get notes for all orders to merge with order data
    const ordersWithNotes = await Promise.all(
      result.orders.map(async (order) => {
        try {
          const noteData = await firestoreService.getOrderNote(order.id);
          // console.log(`Order ${order.id} - Note data:`, {
          //   note: noteData.note,
          //   attention: noteData.attention,
          //   success: noteData.success,
          //   exists: noteData.exists
          // });
          return {
            ...order,
            note: noteData.note,
            attention: noteData.attention
          };
        } catch (error) {
          console.warn(`Could not fetch note for order ${order.id}:`, error.message);
          return {
            ...order,
            note: null,
            attention: false
          };
        }
      })
    );

    // Apply client-side filtering and sorting (search, overdue, attention filters)
    let filteredOrders = ordersWithNotes;
    
    // Apply search filter
    if (searchTerm) {
      filteredOrders = filteredOrders.filter(order => 
        String(order.id).toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply overdue filter
    if (overdueOnly) {
      filteredOrders = filteredOrders.filter(order => {
        if (order.shipping_status !== "unpacked") return false;
        const orderDate = new Date(order.order_date);
        const today = new Date();
        const businessDaysSinceOrder = calculateBusinessDays(orderDate, today);
        return businessDaysSinceOrder > 2;
      });
    }
    
    // Apply attention filter
    if (attentionOnly) {
      filteredOrders = filteredOrders.filter(order => order.attention);
    }
    
    // Sort orders (overdue first, then attention, then by date)
    filteredOrders.sort((a, b) => {
      // First priority: Overdue orders
      const aOverdue = a.shipping_status === "unpacked" && calculateBusinessDays(new Date(a.order_date), new Date()) > 4;
      const bOverdue = b.shipping_status === "unpacked" && calculateBusinessDays(new Date(b.order_date), new Date()) > 4;
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Second priority: Attention orders
      if (aOverdue === bOverdue) {
        if (a.attention && !b.attention) return -1;
        if (!a.attention && b.attention) return 1;
      }
      
      // Third priority: Most recent orders first
      const aDate = new Date(a.order_date);
      const bDate = new Date(b.order_date);
      return bDate.getTime() - aDate.getTime();
    });

    // Update counts in Firebase (non-blocking - don't wait for completion)
    updateCountsInFirebase().catch(error => {
      console.warn('Background counts update failed (non-critical):', error.message);
    });

    res.json({
      success: true,
      data: filteredOrders,
      count: filteredOrders.length,
      totalCount: result.totalCount,
      totalPages: result.totalPages,
      currentPage: page,
      perPage: perPage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching orders:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders',
      message: error.message
    });
  }
});

/**
 * GET /api/orders/counts
 * Get total counts of unshipped and shipped orders
 */
router.get('/counts', async (req, res) => {
  try {
    console.log('Fetching order counts...');
    
    // Get unshipped orders count
    const unshippedResult = await nuvemshopService.fetchOrders(1, 1, 'unshipped');
    const unshippedCount = unshippedResult.totalCount || 0;
    
    // Get shipped orders count  
    const shippedResult = await nuvemshopService.fetchOrders(1, 1, 'shipped');
    const shippedCount = shippedResult.totalCount || 0;
    
    console.log(`Order counts - Unshipped: ${unshippedCount}, Shipped: ${shippedCount}`);
    
    // Update counts in Firebase (non-blocking)
    updateCountsInFirebase().catch(error => {
      console.warn('Background counts update failed (non-critical):', error.message);
    });
    
    res.json({
      success: true,
      data: {
        unshipped: unshippedCount,
        shipped: shippedCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching order counts:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order counts',
      error: error.message
    });
  }
});

/**
 * GET /api/orders/counts/stored
 * Get stored order counts from Firebase
 */
router.get('/counts/stored', async (req, res) => {
  try {
    console.log('Fetching stored order counts from Firebase...');
    
    try {
      const result = await firestoreService.getOrderCounts();
      
      if (!result.success) {
        console.warn('Firebase not available, returning fallback counts');
        // Return fallback counts from first page
        const fallbackResult = await nuvemshopService.fetchOrders(1, 50, 'any');
        const fallbackOrders = fallbackResult.orders || [];
        
        const unshippedCount = fallbackOrders.filter(o => o.shipping_status === 'unshipped').length;
        const shippedCount = fallbackOrders.filter(o => o.shipping_status === 'shipped').length;
        
        return res.json({
          success: true,
          data: {
            unshipped: unshippedCount,
            shipped: shippedCount,
            timestamp: new Date().toISOString(),
            fallback: true
          }
        });
      }
      
      res.json({
        success: true,
        data: result.data,
        timestamp: new Date().toISOString()
      });
      
    } catch (firebaseError) {
      console.warn('Firebase error, returning fallback counts:', firebaseError.message);
      
      // Return fallback counts from first page
      const fallbackResult = await nuvemshopService.fetchOrders(1, 50, 'any');
      const fallbackOrders = fallbackResult.orders || [];
      
      const unshippedCount = fallbackOrders.filter(o => o.shipping_status === 'unshipped').length;
      const shippedCount = fallbackOrders.filter(o => o.shipping_status === 'shipped').length;
      
      res.json({
        success: true,
        data: {
          unshipped: unshippedCount,
          shipped: shippedCount,
          timestamp: new Date().toISOString(),
          fallback: true
        }
      });
    }

  } catch (error) {
    console.error('Error fetching stored order counts:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stored counts',
      error: error.message
    });
  }
});

/**
 * GET /api/orders/attention
 * Returns a list of orders marked as "needs attention"
 */
router.get('/attention', async (req, res) => {
  try {
    console.log('Fetching orders needing attention...');
    
    const result = await firestoreService.getOrdersNeedingAttention();
    
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch attention orders',
        error: result.message
      });
    }
    
    res.json({
      success: true,
      data: result.data,
      count: result.data.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching attention orders:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch attention orders',
      error: error.message
    });
  }
});

/**
 * GET /api/orders/:id
 * Returns a single order by ID with all available details
 */
router.get('/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    
    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    // Fetch order from Nuvemshop
    const order = await nuvemshopService.fetchOrderById(orderId);
    
    // Get note for this order
    const noteData = await firestoreService.getOrderNote(orderId);
    
    const orderWithNote = {
      ...order,
      note: noteData.note,
      attention: noteData.attention
    };

    res.json({
      success: true,
      data: orderWithNote,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error fetching order ${req.params.id}:`, error.message);
    
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'Order not found',
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
        message: error.message
      });
    }
  }
});

/**
 * POST /api/orders/:id/note
 * Saves or updates a manual note for the given order
 */
router.post('/:id/note', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { note, attention } = req.body;

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    if (typeof note !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Note must be a string'
      });
    }

    console.log(`Saving note for order ${orderId}...`);
    
    const result = await firestoreService.saveOrderNote(orderId, {
      note: note.trim(),
      attention: Boolean(attention)
    });

    // Update counts in Firebase (non-blocking)
    updateCountsInFirebase().catch(error => {
      console.warn('Background counts update failed (non-critical):', error.message);
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error saving note for order ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to save note',
      message: error.message
    });
  }
});

/**
 * GET /api/orders/:id/note
 * Returns the saved note and attention flag for the given order
 */
router.get('/:id/note', async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    console.log(`Fetching note for order ${orderId}...`);
    
    const result = await firestoreService.getOrderNote(orderId);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error fetching note for order ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch note',
      message: error.message
    });
  }
});

/**
 * DELETE /api/orders/:id/note
 * Deletes the note for the given order
 */
router.delete('/:id/note', async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId || isNaN(orderId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order ID'
      });
    }

    console.log(`Deleting note for order ${orderId}...`);
    
    const result = await firestoreService.deleteOrderNote(orderId);

    // Update counts in Firebase (non-blocking)
    updateCountsInFirebase().catch(error => {
      console.warn('Background counts update failed (non-critical):', error.message);
    });

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error(`Error deleting note for order ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete note',
      message: error.message
    });
  }
});

module.exports = router;
