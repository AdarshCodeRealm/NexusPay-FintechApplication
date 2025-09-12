import { Router } from 'express';
import { User } from '../models/user.model.js';
import { sequelize } from '../db/index.js';

const router = Router();

// Single clean database status route that shows user count
router.get('/db-status', async (req, res) => {
  try {
    // Test sequelize connection
    await sequelize.authenticate();
    
    // Get user count from database
    const totalUsers = await User.count();
    
    res.status(200).json({
      success: true,
      message: '✅ Database connection successful',
      database: {
        host: sequelize.config.host,
        database: sequelize.config.database,
        status: 'Connected',
        totalUsers: totalUsers
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Database connection failed',
      error: error.message,
      database: {
        status: 'Disconnected',
        totalUsers: 0
      },
      timestamp: new Date().toISOString()
    });
  }
});

export default router;