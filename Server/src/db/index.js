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
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
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

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL Database connected successfully');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

export { sequelize, connectDB };
