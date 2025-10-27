const express = require('express');
const router = express.Router();
const userService = require('../services/userService');

// Mock users for demo purposes (fallback)
const mockUsers = [
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

// Simple JWT-like token generation (for demo purposes)
function generateToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };
  
  // Simple base64 encoding (not secure, just for demo)
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

// Verify token
function verifyToken(token) {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp < now) {
      return null; // Token expired
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * POST /api/auth/login
 * Login user with email and password
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    let user = null;

    // Try to find user in Firebase first
    const firebaseResult = await userService.getUserByEmail(email);
    if (firebaseResult.success && firebaseResult.exists) {
      user = firebaseResult.user;
    } else {
      // Fallback to mock users
      user = mockUsers.find(u => u.email === email && u.password === password);
    }

    // Check password
    if (!user || user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user);
    
    // Return user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    };

    res.json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/verify
 * Verify authentication token
 */
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    let user = null;

    // Try to find user in Firebase first
    const firebaseResult = await userService.getUserById(payload.userId);
    if (firebaseResult.success && firebaseResult.exists) {
      user = firebaseResult.user;
    } else {
      // Fallback to mock users
      user = mockUsers.find(u => u.id === payload.userId);
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    };

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (invalidate token)
 */
router.post('/logout', async (req, res) => {
  try {
    // In a real implementation, you would invalidate the token
    // For demo purposes, we just return success
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const { name, email, avatar } = req.body;
    
    // Find user by ID
    const userIndex = mockUsers.findIndex(u => u.id === payload.userId);
    
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== mockUsers[userIndex].email) {
      const existingUser = mockUsers.find(u => u.email === email && u.id !== payload.userId);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already taken'
        });
      }
    }

    // Update user data
    if (name) mockUsers[userIndex].name = name;
    if (email) mockUsers[userIndex].email = email;
    if (avatar !== undefined) mockUsers[userIndex].avatar = avatar;

    const updatedUser = {
      id: mockUsers[userIndex].id,
      email: mockUsers[userIndex].email,
      name: mockUsers[userIndex].name,
      role: mockUsers[userIndex].role,
      avatar: mockUsers[userIndex].avatar
    };

    res.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    // Check if user already exists in Firebase
    const firebaseResult = await userService.getUserByEmail(email);
    if (firebaseResult.success && firebaseResult.exists) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Check mock users as fallback
    const existingUser = mockUsers.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Generate new user ID
    const userId = Date.now().toString();

    // Create new user
    const newUser = {
      id: userId,
      email,
      password,
      name,
      role,
      avatar: null
    };

    // Try to save to Firebase first
    const createResult = await userService.createUser(newUser);
    if (!createResult.success) {
      console.warn('Failed to create user in Firebase, using fallback');
      // Fallback to mock users
      mockUsers.push(newUser);
    }

    // Generate token
    const token = generateToken(newUser);
    
    const userData = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar: newUser.avatar
    };

    res.status(201).json({
      success: true,
      token,
      user: userData
    });

  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/seed
 * Seed demo users to Firebase
 */
router.post('/seed', async (req, res) => {
  try {
    console.log('Seeding demo users to Firebase...');
    
    const result = await userService.seedDemoUsers();
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Demo users seeded successfully',
        results: result.results,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to seed demo users',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Seed error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const { name, email, avatar } = req.body;

    if (!name && !email && !avatar) {
      return res.status(400).json({
        success: false,
        message: 'At least one field must be provided'
      });
    }

    // Validate email if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
    }

    let user = null;
    let updateData = {};

    // Try to find user in Firebase first
    const firebaseResult = await userService.getUserById(payload.userId);
    if (firebaseResult.success && firebaseResult.exists) {
      user = firebaseResult.user;
      
      // Prepare update data
      if (name) updateData.name = name.trim();
      if (email) updateData.email = email.trim();
      if (avatar !== undefined) updateData.avatar = avatar.trim() || null;

      // Update in Firebase
      const updateResult = await userService.updateUser(payload.userId, updateData);
      if (!updateResult.success) {
        console.warn('Failed to update user in Firebase');
      }
    } else {
      // Fallback to mock users
      user = mockUsers.find(u => u.id === payload.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Update mock user
      if (name) user.name = name.trim();
      if (email) user.email = email.trim();
      if (avatar !== undefined) user.avatar = avatar.trim() || null;
    }

    // Return updated user data (without password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar
    };

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    console.error('Profile update error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * PUT /api/auth/password
 * Change user password
 */
router.put('/password', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    let user = null;

    // Try to find user in Firebase first
    const firebaseResult = await userService.getUserById(payload.userId);
    if (firebaseResult.success && firebaseResult.exists) {
      user = firebaseResult.user;
    } else {
      // Fallback to mock users
      user = mockUsers.find(u => u.id === payload.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    const updateResult = await userService.updateUser(payload.userId, { password: newPassword });
    if (!updateResult.success) {
      console.warn('Failed to update password in Firebase, updating mock user');
      user.password = newPassword;
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Password change error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/auth/account
 * Delete user account
 */
router.delete('/account', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    let user = null;

    // Try to find user in Firebase first
    const firebaseResult = await userService.getUserById(payload.userId);
    if (firebaseResult.success && firebaseResult.exists) {
      user = firebaseResult.user;
    } else {
      // Fallback to mock users
      user = mockUsers.find(u => u.id === payload.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    if (user.password !== password) {
      return res.status(400).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete from Firebase if available
    if (firebaseResult.success && firebaseResult.exists) {
      const deleteResult = await userService.deleteUser(payload.userId);
      if (!deleteResult.success) {
        console.warn('Failed to delete user from Firebase');
      }
    }

    // Remove from mock users as fallback
    const userIndex = mockUsers.findIndex(u => u.id === payload.userId);
    if (userIndex !== -1) {
      mockUsers.splice(userIndex, 1);
    }

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Account deletion error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
