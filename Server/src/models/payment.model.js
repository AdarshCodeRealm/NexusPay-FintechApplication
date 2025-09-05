import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  transactionId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    field: 'merchant_transaction_id', // Map to database column name
    comment: 'Unique transaction ID from payment gateway'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'user_id', // Map to database column name
    references: {
      model: 'users',
      key: 'id',
    },
    comment: 'User who initiated the payment (null for guest payments)'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    comment: 'Payment amount in INR'
  },
  status: {
    type: DataTypes.ENUM('INITIATED', 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'),
    defaultValue: 'INITIATED',
    comment: 'Current status of the payment'
  },
  paymentMethod: {
    type: DataTypes.ENUM('PHONEPE', 'RAZORPAY', 'PAYTM', 'UPI', 'CARD', 'NETBANKING'),
    allowNull: false,
    field: 'payment_method', // Map to database column name
    comment: 'Payment method used'
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'phonepe_transaction_id', // Map to database column name
    comment: 'Transaction ID from payment gateway'
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'provider_response', // Map to database column name
    comment: 'Complete response from payment gateway'
  },
  callbackUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'callback_url', // Map to database column name
    comment: 'Callback URL for payment verification'
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Customer name for the payment'
  },
  customerPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'customer_phone', // Map to database column name
    comment: 'Customer phone number'
  },
  customerEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'customer_email', // Map to database column name
    comment: 'Customer email address'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Payment description or purpose'
  },
  refundAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
    comment: 'Amount refunded if any'
  },
  refundReason: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Reason for refund'
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional payment metadata'
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Payment expiry time'
  }
}, {
  tableName: 'payments',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['merchant_transaction_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['payment_method']
    },
    {
      fields: ['phonepe_transaction_id']
    },
    {
      fields: ['createdAt']
    }
  ]
});

export { Payment };