import { User } from './user.model.js';
import { Transaction } from './transaction.model.js';
import { Beneficiary } from './beneficiary.model.js';

// Define associations
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'recipientId', as: 'receivedTransactions' });
Transaction.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

User.hasMany(Beneficiary, { foreignKey: 'userId', as: 'beneficiaries' });
Beneficiary.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Self-referential association for distributor-retailer relationship
User.hasMany(User, { foreignKey: 'parentDistributorId', as: 'retailers' });
User.belongsTo(User, { foreignKey: 'parentDistributorId', as: 'parentDistributor' });

export {
  User,
  Transaction,
  Beneficiary
};