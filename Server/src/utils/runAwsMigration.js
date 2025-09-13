import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AWS RDS Database Configuration
const dbConfig = {
    host: 'database-1.csv82cm2o697.us-east-1.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'Admin$123',
    database: 'fintech_db',
    ssl: false,
    connectTimeout: 30000
};

async function runMigration() {
    let connection = null;
    
    try {
        console.log('🔄 Connecting to AWS RDS database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to AWS RDS successfully!');

        // Add wallet columns manually with proper error handling
        const alterStatements = [
            "ALTER TABLE users ADD COLUMN wallet_daily_limit DECIMAL(15, 2) DEFAULT 50000.00",
            "ALTER TABLE users ADD COLUMN wallet_monthly_limit DECIMAL(15, 2) DEFAULT 1000000.00", 
            "ALTER TABLE users ADD COLUMN daily_spent DECIMAL(15, 2) DEFAULT 0.00",
            "ALTER TABLE users ADD COLUMN monthly_spent DECIMAL(15, 2) DEFAULT 0.00",
            "ALTER TABLE users ADD COLUMN last_transaction_date TIMESTAMP NULL"
        ];

        console.log('🔄 Adding wallet enhancement columns...');

        for (const statement of alterStatements) {
            try {
                console.log(`Executing: ${statement.substring(0, 60)}...`);
                await connection.execute(statement);
                console.log('✅ Column added successfully');
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME') {
                    console.log(`⚠️  Column already exists, skipping`);
                } else {
                    console.error(`❌ Error: ${error.message}`);
                }
            }
        }

        // Add indexes with proper error handling (without IF NOT EXISTS)
        const indexStatements = [
            "CREATE INDEX idx_users_last_transaction ON users(last_transaction_date)",
            "CREATE INDEX idx_users_daily_spent ON users(daily_spent)",
            "CREATE INDEX idx_users_monthly_spent ON users(monthly_spent)"
        ];

        console.log('🔄 Adding indexes...');
        
        for (const statement of indexStatements) {
            try {
                console.log(`Executing: ${statement.substring(0, 60)}...`);
                await connection.execute(statement);
                console.log('✅ Index created successfully');
            } catch (error) {
                if (error.code === 'ER_DUP_KEYNAME') {
                    console.log(`⚠️  Index already exists, skipping`);
                } else {
                    console.error(`❌ Error creating index: ${error.message}`);
                }
            }
        }

        // Verify the new columns were added
        console.log('🔍 Verifying new columns...');
        const [columns] = await connection.execute("DESCRIBE users");
        const walletColumns = columns.filter(col => 
            ['wallet_daily_limit', 'wallet_monthly_limit', 'daily_spent', 'monthly_spent', 'last_transaction_date']
            .includes(col.Field)
        );

        console.log('📋 Wallet columns in database:');
        walletColumns.forEach(col => {
            console.log(`  ✅ ${col.Field} - ${col.Type} - Default: ${col.Default}`);
        });

        if (walletColumns.length === 5) {
            console.log('🎉 All wallet enhancement columns added successfully!');
            console.log('✅ Your login endpoint should now work properly!');
        } else {
            console.log(`⚠️  Found ${walletColumns.length}/5 columns. Some may be missing.`);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Full error:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the migration
runMigration();