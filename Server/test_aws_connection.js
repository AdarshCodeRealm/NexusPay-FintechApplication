import mysql2 from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔧 Testing AWS RDS Connection...');
  console.log('================================');
  
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectTimeout: 60000, // 60 seconds
    acquireTimeout: 60000,
    timeout: 60000,
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };

  console.log('Connection config:', {
    host: config.host,
    port: config.port,
    user: config.user,
    database: config.database,
    ssl: 'enabled'
  });

  try {
    console.log('\n⏳ Attempting to connect...');
    const connection = await mysql2.createConnection(config);
    
    console.log('✅ Connection successful!');
    
    // Test basic query
    console.log('\n⏳ Testing basic query...');
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query successful:', rows);
    
    // Check if database exists
    console.log('\n⏳ Checking if database exists...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === config.database);
    console.log(`Database '${config.database}' exists:`, dbExists);
    
    if (!dbExists) {
      console.log(`\n⏳ Creating database '${config.database}'...`);
      await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
      console.log('✅ Database created successfully!');
    }
    
    await connection.end();
    console.log('\n🎉 AWS RDS connection test successful!');
    console.log('Your database is ready for migrations.');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nTroubleshooting steps:');
    console.error('1. Check AWS Security Group allows port 3306');
    console.error('2. Ensure RDS instance is publicly accessible');
    console.error('3. Verify credentials in .env file');
    console.error('4. Check if your IP is whitelisted');
  }
}

testConnection();