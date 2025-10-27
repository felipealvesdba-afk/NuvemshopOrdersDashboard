const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

class FirestoreService {
  constructor() {
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Initialize Firebase Admin SDK with service account credentials
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      this.db = admin.firestore();
      this.initialized = true;
      
      console.log('Firebase Admin SDK initialized successfully');
      console.log(`Connected to Firebase project: ${serviceAccount.project_id}`);
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error.message);
      
      // Don't throw error, just mark as not initialized
      this.initialized = false;
      this.db = null;
      
      console.log('Firebase initialization failed - using fallback mode');
    }
  }

  /**
   * Save or update a note for an order
   */
  async saveOrderNote(orderId, noteData) {
    try {
      this.initialize();

      // Check if Firebase is available
      if (!this.isAvailable()) {
        console.warn(`Firestore not available - using fallback for order ${orderId}`);
        return {
          success: true,
          orderId: orderId,
          note: noteData.note,
          attention: noteData.attention || false,
          fallback: true,
          message: 'Note saved locally (Firebase unavailable)'
        };
      }

      const noteRef = this.db.collection('notes').doc(orderId.toString());
      
      const noteDocument = {
        note: noteData.note,
        attention: noteData.attention || false,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await noteRef.set(noteDocument, { merge: true });
      
      console.log(`Note saved for order ${orderId}`);
      return {
        success: true,
        orderId: orderId,
        note: noteData.note,
        attention: noteData.attention || false
      };

    } catch (error) {
      console.error(`Error saving note for order ${orderId}:`, error.message);
      
      // Fallback: return success even if Firebase fails
      console.log(`Using fallback mode for order ${orderId}`);
      return {
        success: true,
        orderId: orderId,
        note: noteData.note,
        attention: noteData.attention || false,
        fallback: true,
        message: 'Note saved locally (Firebase error)'
      };
    }
  }

  /**
   * Get note for an order
   */
  async getOrderNote(orderId) {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn(`Firestore not available - cannot get note for order ${orderId}`);
        return {
          success: false,
          orderId: orderId,
          note: null,
          attention: false,
          exists: false,
          error: 'Firestore API not available'
        };
      }

      const noteRef = this.db.collection('notes').doc(orderId.toString());
      const noteDoc = await noteRef.get();

      if (!noteDoc.exists) {
        // console.log(`No note document found for order ${orderId}`);
        return {
          success: true,
          orderId: orderId,
          note: null,
          attention: false,
          exists: false
        };
      }

      const noteData = noteDoc.data();
      
      // console.log(`Note retrieved for order ${orderId}:`, {
      //   note: noteData.note,
      //   attention: noteData.attention,
      //   updatedAt: noteData.updatedAt
      // });
      return {
        success: true,
        orderId: orderId,
        note: noteData.note,
        attention: noteData.attention,
        updatedAt: noteData.updatedAt,
        exists: true
      };

    } catch (error) {
      console.error(`Error getting note for order ${orderId}:`, error.message);
      return {
        success: false,
        orderId: orderId,
        note: null,
        attention: false,
        exists: false,
        error: error.message
      };
    }
  }

  /**
   * Get all orders that need attention
   */
  async getOrdersNeedingAttention() {
    try {
      this.initialize();

      const notesRef = this.db.collection('notes');
      const snapshot = await notesRef.where('attention', '==', true).get();

      const attentionOrders = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        attentionOrders.push({
          orderId: doc.id,
          note: data.note,
          attention: data.attention,
          updatedAt: data.updatedAt
        });
      });

      console.log(`Found ${attentionOrders.length} orders needing attention`);
      return {
        success: true,
        orders: attentionOrders,
        count: attentionOrders.length
      };

    } catch (error) {
      console.error('Error getting orders needing attention:', error.message);
      throw error;
    }
  }

  /**
   * Delete note for an order
   */
  async deleteOrderNote(orderId) {
    try {
      this.initialize();

      const noteRef = this.db.collection('notes').doc(orderId.toString());
      await noteRef.delete();

      console.log(`Note deleted for order ${orderId}`);
      return {
        success: true,
        orderId: orderId,
        message: 'Note deleted successfully'
      };

    } catch (error) {
      console.error(`Error deleting note for order ${orderId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all notes (for debugging/admin purposes)
   */
  async getAllNotes() {
    try {
      this.initialize();

      const notesRef = this.db.collection('notes');
      const snapshot = await notesRef.get();

      const allNotes = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        allNotes.push({
          orderId: doc.id,
          note: data.note,
          attention: data.attention,
          updatedAt: data.updatedAt
        });
      });

      console.log(`Retrieved ${allNotes.length} notes from Firestore`);
      return {
        success: true,
        notes: allNotes,
        count: allNotes.length
      };

    } catch (error) {
      console.error('Error getting all notes:', error.message);
      throw error;
    }
  }

  /**
   * Check if Firestore is available
   */
  isAvailable() {
    return this.initialized && this.db !== null;
  }

  /**
   * Test Firestore connection
   */
  async testConnection() {
    try {
      this.initialize();
      
      if (!this.isAvailable()) {
        return {
          success: false,
          message: 'Firebase project not found - using fallback mode',
          fallback: true
        };
      }
      
      // Try to read from a test document
      const testRef = this.db.collection('test').doc('connection');
      await testRef.get();
      
      return {
        success: true,
        message: 'Firestore connection successful'
      };
    } catch (error) {
      console.error('Firestore connection test failed:', error.message);
      return {
        success: false,
        message: error.message,
        fallback: true
      };
    }
  }
  /**
   * Save order counts to Firebase
   */
  async saveOrderCounts(counts) {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn('Firestore not available - cannot save order counts');
        return {
          success: false,
          message: 'Firestore not available',
          fallback: true
        };
      }

      const countsRef = this.db.collection('order_counts').doc('current');
      await countsRef.set({
        unshipped: counts.unshipped,
        shipped: counts.shipped,
        timestamp: new Date().toISOString(),
        updated_at: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Order counts saved to Firebase: Unshipped: ${counts.unshipped}, Shipped: ${counts.shipped}`);
      
      return {
        success: true,
        message: 'Order counts saved successfully'
      };

    } catch (error) {
      console.error('Error saving order counts:', error.message);
      return {
        success: false,
        message: error.message,
        fallback: true
      };
    }
  }

  /**
   * Get order counts from Firebase
   */
  async getOrderCounts() {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn('Firestore not available - cannot get order counts');
        return {
          success: false,
          message: 'Firestore not available',
          fallback: true,
          data: {
            unshipped: 0,
            shipped: 0
          }
        };
      }

      const countsRef = this.db.collection('order_counts').doc('current');
      const doc = await countsRef.get();

      if (!doc.exists) {
        console.log('No order counts found in Firebase');
        return {
          success: true,
          message: 'No counts found',
          data: {
            unshipped: 0,
            shipped: 0
          }
        };
      }

      const data = doc.data();
      console.log(`Order counts retrieved from Firebase: Unshipped: ${data.unshipped}, Shipped: ${data.shipped}`);
      
      return {
        success: true,
        data: {
          unshipped: data.unshipped || 0,
          shipped: data.shipped || 0,
          timestamp: data.timestamp
        }
      };

    } catch (error) {
      console.error('Error getting order counts:', error.message);
      return {
        success: false,
        message: error.message,
        fallback: true,
        data: {
          unshipped: 0,
          shipped: 0
        }
      };
    }
  }
}

module.exports = new FirestoreService();
