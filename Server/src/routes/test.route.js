import { Router } from 'express';
import { User } from '../models/user.model.js';
import { sequelize } from '../db/index.js';

const router = Router();

// Test database connection
router.get('/db-status', async (req, res) => {
  try {
    // Test sequelize connection
    await sequelize.authenticate();
    
    res.status(200).json({
      success: true,
      message: '✅ Database connection is working!',
      database: {
        host: sequelize.config.host,
        database: sequelize.config.database,
        dialect: sequelize.config.dialect,
        status: 'Connected'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get all users (unprotected for testing)
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'fullName', 'email', 'username', 'phone', 'role', 'walletBalance', 'kycStatus', 'isActive', 'createdAt'],
      limit: 10, // Limit to first 10 users
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      message: `✅ Found ${users.length} users`,
      count: users.length,
      data: users,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch users',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get user count
router.get('/user-count', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const verifiedUsers = await User.count({ where: { phoneVerified: true } });

    res.status(200).json({
      success: true,
      message: '✅ User statistics fetched successfully',
      data: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        inactiveUsers: totalUsers - activeUsers
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch user count',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get specific user by ID (unprotected for testing)
router.get('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password', 'refreshToken', 'otpCode'] } // Exclude sensitive data
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '❌ User not found',
        timestamp: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      message: '✅ User found successfully',
      data: user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Failed to fetch user',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;