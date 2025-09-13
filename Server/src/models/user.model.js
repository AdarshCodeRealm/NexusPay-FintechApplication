import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'full_name', // Map to database column name
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 15],
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'retailer', 'distributor', 'admin'),
    defaultValue: 'user',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active', // Map to database column name
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'phone_verified', // Map to database column name
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'otp_code', // Map to database column name
  },
  otpExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'otp_expiry', // Map to database column name
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refresh_token', // Map to database column name
  },
  walletBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'wallet_balance', // Map to database column name
  },
  walletFrozenBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'wallet_frozen_balance', // Map to database column name
  },
  // Enhanced wallet features - Now enabled since database columns exist
  walletDailyLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 50000.00,
    field: 'wallet_daily_limit',
  },
  walletMonthlyLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 1000000.00,
    field: 'wallet_monthly_limit',
  },
  dailySpent: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'daily_spent',
  },
  monthlySpent: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'monthly_spent',
  },
  lastTransactionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_transaction_date',
  },
  kycStatus: {
    type: DataTypes.ENUM('pending', 'submitted', 'approved', 'rejected'),
    defaultValue: 'pending',
    field: 'kyc_status', // Map to database column name
  },
  kycDocuments: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'kyc_documents', // Map to database column name
  },
  businessInfo: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'business_info', // Map to database column name
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
    field: 'commission_rate', // Map to database column name
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_of_birth', // Map to database column name
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  country: {
    type: DataTypes.STRING,
    defaultValue: 'India',
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified', // Map to database column name
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'email_verified', // Map to database column name
  },
  accountStatus: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
    field: 'account_status', // Map to database column name
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login', // Map to database column name
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'login_attempts', // Map to database column name
  },
  isLocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_locked', // Map to database column name
  },
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'locked_until', // Map to database column name
  },
  panNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'pan_number', // Map to database column name
  },
  aadharNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'aadhar_number', // Map to database column name
  },
  preferences: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  notificationSettings: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'notification_settings', // Map to database column name
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'en',
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at', // Map to database column name
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at', // Map to database column name
  }
}, {
  tableName: 'users',
  timestamps: false, // We're handling timestamps manually
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.generateAccessToken = function() {
  try {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error('ACCESS_TOKEN_SECRET environment variable is not set');
    }
    
    return jwt.sign(
      {
        _id: this.id,
        email: this.email,
        username: this.username,
        fullName: this.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1d' }
    );
  } catch (error) {
    console.error('Access token generation failed:', error.message);
    throw error;
  }
};

User.prototype.generateRefreshToken = function() {
  try {
    if (!process.env.REFRESH_TOKEN_SECRET) {
      throw new Error('REFRESH_TOKEN_SECRET environment variable is not set');
    }
    
    return jwt.sign(
      { _id: this.id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '10d' }
    );
  } catch (error) {
    console.error('Refresh token generation failed:', error.message);
    throw error;
  }
};

export { User };