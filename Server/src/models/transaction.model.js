import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM(
      'wallet_topup',
      'wallet_transfer',
      'mobile_recharge',
      'dth_recharge',
      'withdrawal',
      'commission_credit',
      'cashback_credit'
    ),
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  balanceBefore: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  balanceAfter: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    defaultValue: 'pending',
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  referenceId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  externalTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  recipientPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  commissionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
  },
}, {
  tableName: 'transactions',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['status']
    },
    {
      fields: ['referenceId']
    },
    {
      fields: ['createdAt']
    }
  ]
});

export { Transaction };