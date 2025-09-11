import { sequelize } from '../db/index.js';

export const fixWalletTransferIssues = async () => {
    const transaction = await sequelize.transaction();
    
    try {
        console.log('🔧 Starting wallet transfer fixes...');
        
        // Check if columns exist before adding them
        const checkAndAddColumns = async () => {
            console.log('📋 Checking existing table structure...');
            
            // Get current table structure
            const [tableInfo] = await sequelize.query(
                "DESCRIBE users",
                { transaction }
            );
            
            const existingColumns = tableInfo.map(col => col.Field);
            console.log('📋 Existing columns:', existingColumns.join(', '));
            
            const columnsToAdd = [
                {
                    name: 'wallet_daily_limit',
                    definition: 'DECIMAL(15, 2) DEFAULT 50000.00'
                },
                {
                    name: 'wallet_monthly_limit', 
                    definition: 'DECIMAL(15, 2) DEFAULT 1000000.00'
                },
                {
                    name: 'daily_spent',
                    definition: 'DECIMAL(15, 2) DEFAULT 0.00'
                },
                {
                    name: 'monthly_spent',
                    definition: 'DECIMAL(15, 2) DEFAULT 0.00'
                },
                {
                    name: 'last_transaction_date',
                    definition: 'TIMESTAMP NULL'
                }
            ];
            
            for (const column of columnsToAdd) {
                if (!existingColumns.includes(column.name)) {
                    console.log(`➕ Adding column: ${column.name}`);
                    await sequelize.query(
                        `ALTER TABLE users ADD COLUMN ${column.name} ${column.definition}`,
                        { transaction }
                    );
                    console.log(`✅ Added column: ${column.name}`);
                } else {
                    console.log(`⏭️ Column ${column.name} already exists`);
                }
            }
        };
        
        await checkAndAddColumns();
        
        // Add indexes if they don't exist
        const addIndexes = async () => {
            const indexes = [
                'idx_users_last_transaction',
                'idx_users_daily_spent', 
                'idx_users_monthly_spent'
            ];
            
            for (const indexName of indexes) {
                try {
                    console.log(`🔍 Creating index: ${indexName}`);
                    
                    if (indexName === 'idx_users_last_transaction') {
                        await sequelize.query(
                            `CREATE INDEX ${indexName} ON users(last_transaction_date)`,
                            { transaction }
                        );
                    } else if (indexName === 'idx_users_daily_spent') {
                        await sequelize.query(
                            `CREATE INDEX ${indexName} ON users(daily_spent)`,
                            { transaction }
                        );
                    } else if (indexName === 'idx_users_monthly_spent') {
                        await sequelize.query(
                            `CREATE INDEX ${indexName} ON users(monthly_spent)`,
                            { transaction }
                        );
                    }
                    
                    console.log(`✅ Created index: ${indexName}`);
                } catch (error) {
                    if (error.message.includes('Duplicate key name')) {
                        console.log(`⏭️ Index ${indexName} already exists`);
                    } else {
                        console.log(`⚠️ Index creation warning for ${indexName}:`, error.message);
                    }
                }
            }
        };
        
        await addIndexes();
        
        // Update existing data
        const queries = [
            // Ensure wallet_balance has proper default values
            `UPDATE users SET wallet_balance = 0.00 WHERE wallet_balance IS NULL`,
            `UPDATE users SET wallet_frozen_balance = 0.00 WHERE wallet_frozen_balance IS NULL`,
        ];
        
        for (const query of queries) {
            try {
                await sequelize.query(query, { transaction });
                console.log('✅ Executed:', query.substring(0, 50) + '...');
            } catch (error) {
                console.log('⚠️ Query warning:', error.message);
            }
        }
        
        // Check if new columns exist before setting defaults
        const [updatedTableInfo] = await sequelize.query(
            "DESCRIBE users",
            { transaction }
        );
        
        const updatedColumns = updatedTableInfo.map(col => col.Field);
        
        if (updatedColumns.includes('wallet_daily_limit')) {
            await sequelize.query(
                `UPDATE users SET wallet_daily_limit = 50000.00 WHERE wallet_daily_limit IS NULL`,
                { transaction }
            );
            console.log('✅ Set default daily limits');
        }
        
        if (updatedColumns.includes('wallet_monthly_limit')) {
            await sequelize.query(
                `UPDATE users SET wallet_monthly_limit = 1000000.00 WHERE wallet_monthly_limit IS NULL`,
                { transaction }
            );
            console.log('✅ Set default monthly limits');
        }
        
        await transaction.commit();
        console.log('✅ Wallet transfer fixes completed successfully!');
        
        return true;
        
    } catch (error) {
        await transaction.rollback();
        console.error('❌ Failed to apply wallet fixes:', error);
        throw error;
    }
};