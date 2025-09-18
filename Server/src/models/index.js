import { User } from './user.model.js';
import { Account } from './account.model.js';
import { Transaction } from './transaction.model.js';
import { Beneficiary } from './beneficiary.model.js';
import { Payment } from './payment.model.js';
import { Notification } from './notification.model.js';
import { MoneyRequest } from './moneyRequest.model.js';

// Define associations
User.hasMany(Account, { foreignKey: 'userId', as: 'accounts' });
Account.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'recipientId', as: 'receivedTransactions' });
Transaction.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

Account.hasMany(Transaction, { foreignKey: 'fromAccountId', as: 'outgoingTransactions' });
Transaction.belongsTo(Account, { foreignKey: 'fromAccountId', as: 'fromAccount' });

Account.hasMany(Transaction, { foreignKey: 'toAccountId', as: 'incomingTransactions' });
Transaction.belongsTo(Account, { foreignKey: 'toAccountId', as: 'toAccount' });

User.hasMany(Beneficiary, { foreignKey: 'userId', as: 'beneficiaries' });
Beneficiary.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Payment associations
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notification associations
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// MoneyRequest associations
User.hasMany(MoneyRequest, { foreignKey: 'requesterId', as: 'sentRequests' });
MoneyRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });

User.hasMany(MoneyRequest, { foreignKey: 'payerId', as: 'receivedRequests' });
MoneyRequest.belongsTo(User, { foreignKey: 'payerId', as: 'payer' });

Transaction.hasOne(MoneyRequest, { foreignKey: 'transactionId', as: 'moneyRequest' });
MoneyRequest.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

// Self-referential association for distributor-retailer relationship
// Temporarily commented out until distributorId column is added to database
/*
User.hasMany(User, { 
  foreignKey: 'distributorId', 
  as: 'retailers',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

User.belongsTo(User, { 
  foreignKey: 'distributorId', 
  as: 'distributor',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});
*/

export {
  User,
  Account,
  Transaction,
  Beneficiary,
  Payment,
  Notification,
  MoneyRequest
};