import mysql2 from 'mysql2/promise';
import { connectDB, sequelize } from '../db/index.js';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const testDatabaseConnectivity = async () => {
    console.log('🧪 Testing database connectivity for production deployment...\n');
    
    // Test 1: Environment Variables
    console.log('📋 Environment Variables Check:');
    console.log(`DB_HOST: ${process.env.DB_HOST}`);
    console.log(`DB_PORT: ${process.env.DB_PORT}`);
    console.log(`DB_NAME: ${process.env.DB_NAME}`);
    console.log(`DB_USER: ${process.env.DB_USER}`);
    console.log(`DB_PASSWORD: ${process.env.DB_PASSWORD ? '***SET***' : 'NOT_SET'}`);
    console.log('');
    
    // Test 2: Raw MySQL2 Connection
    console.log('🔌 Testing raw MySQL2 connection...');
    try {
        const connection = await mysql2.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectTimeout: 30000,
            acquireTimeout: 30000,
            timeout: 30000,
            ssl: {
                require: false,
                rejectUnauthorized: false
            }
        });
        
        console.log('✅ Raw MySQL2 connection successful');
        
        // Test query
        const [rows] = await connection.execute('SELECT 1 as test');
        console.log('✅ Test query successful:', rows[0]);
        
        await connection.end();
        console.log('✅ Connection closed successfully\n');
    } catch (error) {
        console.error('❌ Raw MySQL2 connection failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Code: ${error.code}`);
        console.error(`   Errno: ${error.errno}\n`);
    }
    
    // Test 3: Sequelize Connection
    console.log('🔗 Testing Sequelize connection...');
    try {
        await sequelize.authenticate();
        console.log('✅ Sequelize authentication successful');
        
        // Test database exists
        const [results] = await sequelize.query('SELECT DATABASE() as current_db');
        console.log('✅ Current database:', results[0].current_db);
        
        // Test table access
        const [tables] = await sequelize.query('SHOW TABLES');
        console.log('✅ Available tables:', tables.length);
        
        console.log('✅ Sequelize connection test completed\n');
    } catch (error) {
        console.error('❌ Sequelize connection failed:');
        console.error(`   Error: ${error.message}`);
        console.error(`   Name: ${error.name}\n`);
    }
    
    // Test 4: Full ConnectDB Function
    console.log('🚀 Testing full connectDB function...');
    try {
        await connectDB();
        console.log('✅ connectDB function successful\n');
    } catch (error) {
        console.error('❌ connectDB function failed:');
        console.error(`   Error: ${error.message}\n`);
    }
    
    console.log('🎯 Connectivity test completed!');
    console.log('\n📋 Troubleshooting Guide:');
    console.log('1. If raw MySQL2 fails with ENOTFOUND: Check RDS endpoint URL');
    console.log('2. If raw MySQL2 fails with ECONNREFUSED: Check security groups');
    console.log('3. If raw MySQL2 fails with ER_ACCESS_DENIED: Check credentials');
    console.log('4. If timeout errors: Check network latency and increase timeouts');
    console.log('5. For Vercel deployment: Ensure environment variables are set in Vercel dashboard');
    
    process.exit(0);
};

// Run the test
testDatabaseConnectivity().catch(error => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
});