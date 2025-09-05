import { Sequelize } from 'sequelize';
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

// Initialize Sequelize connection
const sequelize = new Sequelize(
  process.env.DB_NAME || 'fintech_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'admin',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Disable logging in production
    pool: {
      max: 5, // Reduced for serverless
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true,
    },
  }
);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return sequelize;
  }
  
  try { 
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully');
    
    // Only sync in development, not in production serverless
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database synchronized');
    }
    
    isConnected = true;
    return sequelize;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

export { sequelize, connectDB };
