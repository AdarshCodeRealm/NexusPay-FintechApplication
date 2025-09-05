import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 30],
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [10, 15],
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('user', 'retailer', 'distributor', 'admin'),
    defaultValue: 'user',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  otpExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  refreshToken: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  walletBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  walletFrozenBalance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0.00,
  },
  kycStatus: {
    type: DataTypes.ENUM('pending', 'submitted', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  kycDocuments: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  businessInfo: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
  },
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

User.prototype.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.generateAccessToken = function() {
  return jwt.sign(
    {
      _id: this.id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

User.prototype.generateRefreshToken = function() {
  return jwt.sign(
    { _id: this.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export { User };