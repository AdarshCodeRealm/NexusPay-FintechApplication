import mysql from 'mysql2/promise';
import { UserSchema } from '../models/schemas/user.schema.js';
import { AccountSchema } from '../models/schemas/account.schema.js';
import { TransactionSchema } from '../models/schemas/transaction.schema.js';
import { PaymentSchema } from '../models/schemas/payment.schema.js';
import { BeneficiarySchema } from '../models/schemas/beneficiary.schema.js';

export class DatabaseMigrations {
    constructor(pool) {
        this.pool = pool;
        this.schemas = [
            UserSchema,
            AccountSchema,
            BeneficiarySchema,
            PaymentSchema,
            TransactionSchema
        ];
    }

    // Create migrations tracking table
    async createMigrationsTable() {
        try {
            await this.pool.execute(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    migration_name VARCHAR(255) NOT NULL UNIQUE,
                    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    INDEX idx_migration_name (migration_name)
                )
            `);
            console.log('✅ Migrations tracking table ready');
        } catch (error) {
            console.error('❌ Error creating migrations table:', error.message);
            throw error;
        }
    }

    // Check if migration already applied
    async isMigrationApplied(migrationName) {
        try {
            const [rows] = await this.pool.execute(
                'SELECT * FROM migrations WHERE migration_name = ?',
                [migrationName]
            );
            return rows.length > 0;
        } catch (error) {
            return false;
        }
    }

    // Mark migration as completed
    async markMigrationAsApplied(migrationName) {
        try {
            await this.pool.execute(
                'INSERT INTO migrations (migration_name) VALUES (?)',
                [migrationName]
            );
        } catch (error) {
            console.error('❌ Error marking migration:', error.message);
        }
    }

    // Generate CREATE TABLE query from schema
    generateCreateTableQuery(schema) {
        const { tableName, schema: tableSchema, foreignKeys = [] } = schema;
        
        // Convert schema object to SQL
        const columns = Object.entries(tableSchema)
            .map(([column, definition]) => `    ${column} ${definition}`)
            .join(',\n');
        
        // Add foreign keys if any
        const fkConstraints = foreignKeys.length > 0 
            ? ',\n    ' + foreignKeys.join(',\n    ')
            : '';
        
        return `CREATE TABLE IF NOT EXISTS ${tableName} (
${columns}${fkConstraints}
)`;
    }

    // Run single migration
    async runMigration(migrationName, queries) {
        const isApplied = await this.isMigrationApplied(migrationName);
        
        if (isApplied) {
            console.log(`⏭️  Already applied: ${migrationName}`);
            return;
        }

        try {
            console.log(`🔄 Running: ${migrationName}`);
            
            for (const query of queries) {
                await this.pool.execute(query);
            }
            
            await this.markMigrationAsApplied(migrationName);
            console.log(`✅ Completed: ${migrationName}`);
        } catch (error) {
            console.error(`❌ Failed: ${migrationName}`, error.message);
            throw error;
        }
    }

    // Run all migrations
    async runAllMigrations() {
        try {
            console.log('🔄 Starting database migrations...');
            
            await this.createMigrationsTable();

            // Define all your migrations here in order
            const migrations = [
                {
                    name: '001_create_initial_tables',
                    queries: this.getInitialTablesMigration()
                },
                {
                    name: '002_create_additional_tables',
                    queries: this.getAdditionalTablesMigration()
                },
                // Future migrations can be added here
                // {
                //     name: '003_add_user_preferences',
                //     queries: ['ALTER TABLE users ADD COLUMN new_field VARCHAR(255) NULL']
                // }
            ];

            // Execute each migration
            for (const migration of migrations) {
                await this.runMigration(migration.name, migration.queries);
            }

            console.log('🎉 All migrations completed!');
        } catch (error) {
            console.error('💥 Migration failed:', error.message);
            throw error;
        }
    }

    // Migration 001: Create all schema tables
    getInitialTablesMigration() {
        return this.schemas.map(schema => this.generateCreateTableQuery(schema));
    }

    // Migration 002: Additional tables and features
    getAdditionalTablesMigration() {
        return [
            // OTP table for verification
            `CREATE TABLE IF NOT EXISTS otps (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                otp_code VARCHAR(6) NOT NULL,
                otp_type ENUM('email', 'phone', 'transaction', 'login') NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_used BOOLEAN DEFAULT FALSE,
                attempts INT DEFAULT 0,
                max_attempts INT DEFAULT 3,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_otp (user_id, otp_type),
                INDEX idx_expiry (expires_at)
            )`,
            
            // API Keys table for third-party integrations
            `CREATE TABLE IF NOT EXISTS api_keys (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                key_name VARCHAR(100) NOT NULL,
                api_key VARCHAR(255) NOT NULL UNIQUE,
                api_secret VARCHAR(255) NULL,
                permissions TEXT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                expires_at TIMESTAMP NULL,
                last_used_at TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_api_key (api_key),
                INDEX idx_user_keys (user_id)
            )`,
            
            // Notifications table
            `CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('info', 'success', 'warning', 'error', 'transaction') DEFAULT 'info',
                is_read BOOLEAN DEFAULT FALSE,
                action_url VARCHAR(255) NULL,
                metadata TEXT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_notifications (user_id),
                INDEX idx_unread (user_id, is_read)
            )`,
            
            // System settings table
            `CREATE TABLE IF NOT EXISTS system_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT NOT NULL,
                setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
                description TEXT NULL,
                is_public BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_setting_key (setting_key)
            )`
        ];
    }
}