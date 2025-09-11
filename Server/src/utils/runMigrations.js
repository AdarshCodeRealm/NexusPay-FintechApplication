import { sequelize } from '../db/index.js';
import { DatabaseMigrations } from '../db/migrations.js';

// Run database migrations
const runMigrations = async () => {
    try {
        console.log('🔄 Starting wallet enhancements migration...');
        
        // Get the raw MySQL connection pool from Sequelize
        const pool = sequelize.connectionManager.pool;
        
        // Create migrations instance
        const migrations = new DatabaseMigrations(pool);
        
        // Run all migrations
        await migrations.runAllMigrations();
        
        console.log('✅ Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigrations();
}

export { runMigrations };