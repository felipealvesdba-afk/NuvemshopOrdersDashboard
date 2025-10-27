const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

class UserService {
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
      // Check if Firebase Admin SDK is already initialized
      if (admin.apps.length > 0) {
        this.db = admin.firestore();
        this.initialized = true;
        console.log('UserService using existing Firebase Admin SDK');
        return;
      }

      // Initialize Firebase Admin SDK with service account credentials
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      this.db = admin.firestore();
      this.initialized = true;
      
      console.log('UserService Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Error initializing UserService Firebase Admin SDK:', error.message);
      
      // Don't throw error, just mark as not initialized
      this.initialized = false;
      this.db = null;
      
      console.log('UserService Firebase initialization failed - using fallback mode');
    }
  }

  /**
   * Check if Firestore is available
   */
  isAvailable() {
    return this.initialized && this.db !== null;
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn('Firestore not available - using fallback for user creation');
        return {
          success: false,
          error: 'Firestore API not available'
        };
      }

      const userRef = this.db.collection('users').doc(userData.id);
      
      const userDocument = {
        id: userData.id,
        email: userData.email,
        password: userData.password, // In production, this should be hashed
        name: userData.name,
        role: userData.role || 'user',
        avatar: userData.avatar || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await userRef.set(userDocument);
      
      console.log(`User created: ${userData.email}`);
      return {
        success: true,
        userId: userData.id,
        email: userData.email
      };

    } catch (error) {
      console.error(`Error creating user ${userData.email}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn('Firestore not available - using fallback for user lookup');
        return {
          success: false,
          user: null,
          error: 'Firestore API not available'
        };
      }

      const usersRef = this.db.collection('users');
      const snapshot = await usersRef.where('email', '==', email).limit(1).get();

      if (snapshot.empty) {
        return {
          success: true,
          user: null,
          exists: false
        };
      }

      const userDoc = snapshot.docs[0];
      const userData = userDoc.data();
      
      console.log(`User found: ${email}`);
      return {
        success: true,
        user: userData,
        exists: true
      };

    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error.message);
      return {
        success: false,
        user: null,
        error: error.message
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn('Firestore not available - using fallback for user lookup');
        return {
          success: false,
          user: null,
          error: 'Firestore API not available'
        };
      }

      const userRef = this.db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return {
          success: true,
          user: null,
          exists: false
        };
      }

      const userData = userDoc.data();
      
      console.log(`User found by ID: ${userId}`);
      return {
        success: true,
        user: userData,
        exists: true
      };

    } catch (error) {
      console.error(`Error getting user by ID ${userId}:`, error.message);
      return {
        success: false,
        user: null,
        error: error.message
      };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId, updateData) {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn('Firestore not available - using fallback for user update');
        return {
          success: false,
          error: 'Firestore API not available'
        };
      }

      const userRef = this.db.collection('users').doc(userId);
      
      const updateDocument = {
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await userRef.update(updateDocument);
      
      console.log(`User updated: ${userId}`);
      return {
        success: true,
        userId: userId
      };

    } catch (error) {
      console.error(`Error updating user ${userId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId) {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn('Firestore not available - using fallback for user deletion');
        return {
          success: false,
          error: 'Firestore API not available'
        };
      }

      const userRef = this.db.collection('users').doc(userId);
      await userRef.delete();
      
      console.log(`User deleted: ${userId}`);
      return {
        success: true,
        userId: userId
      };

    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all users (for admin purposes)
   */
  async getAllUsers() {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn('Firestore not available - using fallback for user listing');
        return {
          success: false,
          users: [],
          error: 'Firestore API not available'
        };
      }

      const usersRef = this.db.collection('users');
      const snapshot = await usersRef.get();

      const users = [];
      snapshot.forEach(doc => {
        const userData = doc.data();
        // Remove password from response
        const { password, ...safeUserData } = userData;
        users.push(safeUserData);
      });

      console.log(`Retrieved ${users.length} users from Firestore`);
      return {
        success: true,
        users: users,
        count: users.length
      };

    } catch (error) {
      console.error('Error getting all users:', error.message);
      return {
        success: false,
        users: [],
        error: error.message
      };
    }
  }

  /**
   * Seed demo users
   */
  async seedDemoUsers() {
    try {
      this.initialize();

      if (!this.isAvailable()) {
        console.warn('Firestore not available - cannot seed demo users');
        return {
          success: false,
          error: 'Firestore API not available'
        };
      }

      const demoUsers = [
        {
          id: '1',
          email: 'demo@nuvemshop.com',
          password: 'demo123',
          name: 'Demo User',
          role: 'admin',
          avatar: null
        },
        {
          id: '2',
          email: 'manager@nuvemshop.com',
          password: 'manager123',
          name: 'Manager User',
          role: 'manager',
          avatar: null
        },
        {
          id: '3',
          email: 'user@nuvemshop.com',
          password: 'user123',
          name: 'Regular User',
          role: 'user',
          avatar: null
        }
      ];

      const results = [];
      
      for (const userData of demoUsers) {
        try {
          // Check if user already exists
          const existingUser = await this.getUserByEmail(userData.email);
          if (existingUser.exists) {
            console.log(`User ${userData.email} already exists, skipping`);
            results.push({
              email: userData.email,
              success: true,
              message: 'Already exists'
            });
            continue;
          }

          const result = await this.createUser(userData);
          results.push({
            email: userData.email,
            success: result.success,
            error: result.error
          });
        } catch (error) {
          results.push({
            email: userData.email,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        results: results
      };

    } catch (error) {
      console.error('Error seeding demo users:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new UserService();
