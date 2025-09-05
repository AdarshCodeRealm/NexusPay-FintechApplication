import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fromAccountId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'from_account_id', // Map to database column name
    references: {
      model: 'accounts',
      key: 'id',
    },
  },
  toAccountId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'to_account_id', // Map to database column name
    references: {
      model: 'accounts',
      key: 'id',
    },
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
  transactionType: {
    type: DataTypes.ENUM(
      'transfer',
      'deposit',
      'withdrawal',
      'payment',
      'refund',
      'fee',
      'commission'
    ),
    allowNull: false,
    field: 'transaction_type', // Map to database column name
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  feeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'fee_amount', // Map to database column name
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'INR',
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  referenceNumber: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'reference_number', // Map to database column name
  },
  bankReference: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'bank_reference', // Map to database column name
  },
  utrNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'utr_number', // Map to database column name
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'payment_method', // Map to database column name
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'),
    defaultValue: 'pending',
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'failure_reason', // Map to database column name
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'processed_at', // Map to database column name
  },
  beneficiaryName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'beneficiary_name', // Map to database column name
  },
  beneficiaryAccount: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'beneficiary_account', // Map to database column name
  },
  beneficiaryIfsc: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'beneficiary_ifsc', // Map to database column name
  },
  beneficiaryBank: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'beneficiary_bank', // Map to database column name
  },
  openingBalance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'opening_balance', // Map to database column name
  },
  closingBalance: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'closing_balance', // Map to database column name
  },
  transactionMetadata: {
    type: DataTypes.TEXT, // Using TEXT instead of JSON for compatibility
    allowNull: true,
    field: 'transaction_metadata', // Map to database column name
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'ip_address', // Map to database column name
  },
  deviceInfo: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'device_info', // Map to database column name
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
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
  tableName: 'transactions',
  timestamps: false, // We're handling timestamps manually
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['transaction_type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['reference_number']
    },
    {
      fields: ['created_at']
    }
  ]
});

export { Transaction };