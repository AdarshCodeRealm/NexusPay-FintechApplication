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
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ifscCode: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  accountType: {
    type: DataTypes.ENUM('savings', 'current'),
    defaultValue: 'savings',
  },
  nickname: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'beneficiaries',
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['accountNumber']
    }
  ]
});

export { Beneficiary };