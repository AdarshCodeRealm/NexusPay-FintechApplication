import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const MoneyRequest = sequelize.define('MoneyRequest', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  requesterId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'requester_id',
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who is requesting money'
  },
  payerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'payer_id', 
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who should pay the money'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Amount being requested'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Optional description for the request'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'declined', 'cancelled', 'expired'),
    defaultValue: 'pending',
    comment: 'Current status of the money request'
  },
  requestReference: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'request_reference',
    comment: 'Unique reference ID for the request'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at',
    comment: 'When the request expires (optional)'
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'paid_at',
    comment: 'When the request was paid'
  },
  transactionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'transaction_id',
    references: {
      model: 'transactions',
      key: 'id',
    },
    comment: 'Associated transaction ID if paid'
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const value = this.getDataValue('metadata');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('metadata', value ? JSON.stringify(value) : null);
    },
    comment: 'Additional metadata for the request'
  }
}, {
  tableName: 'money_requests',
  timestamps: true,
  indexes: [
    {
      fields: ['requester_id']
    },
    {
      fields: ['payer_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['request_reference']
    },
    {
      fields: ['expires_at']
    }
  ]
});

export { MoneyRequest };