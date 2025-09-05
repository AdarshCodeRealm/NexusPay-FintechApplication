import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Beneficiary = sequelize.define('Beneficiary', {
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
  beneficiaryName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'beneficiary_name', // Map to database column name
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'account_number', // Map to database column name
  },
  ifscCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'ifsc_code', // Map to database column name
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'bank_name', // Map to database column name
  },
  accountType: {
    type: DataTypes.ENUM('savings', 'current', 'nri'),
    defaultValue: 'savings',
    field: 'account_type', // Map to database column name
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  beneficiaryType: {
    type: DataTypes.ENUM('individual', 'business'),
    defaultValue: 'individual',
    field: 'beneficiary_type', // Map to database column name
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active', // Map to database column name
  },
  isFavorite: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_favorite', // Map to database column name
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_verified', // Map to database column name
  },
  verificationStatus: {
    type: DataTypes.ENUM('pending', 'verified', 'failed'),
    defaultValue: 'pending',
    field: 'verification_status', // Map to database column name
  },
  verificationDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'verification_date', // Map to database column name
  },
  beneficiaryMetadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'beneficiary_metadata', // Map to database column name
  },
  lastTransactionDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_transaction_date', // Map to database column name
  },
  totalTransactions: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_transactions', // Map to database column name
  },
  totalAmountSent: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    field: 'total_amount_sent', // Map to database column name
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
  },
}, {
  tableName: 'beneficiaries',
  timestamps: false, // We're handling timestamps manually
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['account_number']
    }
  ]
});

export { Beneficiary };