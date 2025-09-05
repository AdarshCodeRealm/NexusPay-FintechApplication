import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Account = sequelize.define('Account', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id', // Map to database column name
    references: {
      model: 'users',
      key: 'id',
    },
  },
  accountNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'account_number', // Map to database column name
  },
  accountType: {
    type: DataTypes.ENUM('savings', 'current', 'business', 'premium'),
    defaultValue: 'savings',
    field: 'account_type', // Map to database column name
  },
  balance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  availableBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'available_balance', // Map to database column name
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'blocked', 'frozen'),
    defaultValue: 'active',
  },
  overdraftLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'overdraft_limit', // Map to database column name
  },
  dailyLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 50000.00,
    field: 'daily_limit', // Map to database column name
  },
  monthlyLimit: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 1000000.00,
    field: 'monthly_limit', // Map to database column name
  },
  totalDailyUsed: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'total_daily_used', // Map to database column name
  },
  totalMonthlyUsed: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'total_monthly_used', // Map to database column name
  },
  branchCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'branch_code', // Map to database column name
  },
  ifscCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ifsc_code', // Map to database column name
  },
  accountHolderName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'account_holder_name', // Map to database column name
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'bank_name', // Map to database column name
  },
  accountMetadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'account_metadata', // Map to database column name
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
  tableName: 'accounts',
  timestamps: false, // We're handling timestamps manually
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['account_number']
    },
    {
      fields: ['status']
    }
  ]
});

export { Account };