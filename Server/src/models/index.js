import { User } from './user.model.js';
import { Account } from './account.model.js';
import { Transaction } from './transaction.model.js';
import { Beneficiary } from './beneficiary.model.js';
import { Payment } from './payment.model.js';

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

// Self-referential association for distributor-retailer relationship
User.hasMany(User, { foreignKey: 'parentDistributorId', as: 'retailers' });
User.belongsTo(User, { foreignKey: 'parentDistributorId', as: 'parentDistributor' });

export {
  User,
  Account,
  Transaction,
  Beneficiary,
  Payment
};