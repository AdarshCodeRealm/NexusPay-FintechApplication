import { User } from '../models/index.js';
import { connectDB, sequelize } from '../db/index.js';
import { Op } from 'sequelize';

const seedUsers = async () => {
    try {
        console.log('🌱 Starting to seed users...');

        const testUsers = [
            {
                fullName: 'John Doe',
                email: 'john@example.com',
                username: 'johndoe',
                phone: '9876543210',
                password: 'password123', // Will be hashed automatically by the model hook
                role: 'user',
                phoneVerified: true,
                isActive: true,
                walletBalance: 1000.00
            },
            {
                fullName: 'Jane Smith',
                email: 'jane@example.com',
                username: 'janesmith',
                phone: '9876543211',
                password: 'password123',
                role: 'user',
                phoneVerified: true,
                isActive: true,
                walletBalance: 2500.00
            },
            {
                fullName: 'Bob Johnson',
                email: 'bob@example.com',
                username: 'bobjohnson',
                phone: '9876543212',
                password: 'password123',
                role: 'retailer',
                phoneVerified: true,
                isActive: true,
                walletBalance: 5000.00,
                commissionRate: 2.5
            }
        ];

        // Check if users already exist and create them
        for (const userData of testUsers) {
            const existingUser = await User.findOne({
                where: {
                    [Op.or]: [
                        { email: userData.email },
                        { username: userData.username },
                        { phone: userData.phone }
                    ]
                }
            });

            if (!existingUser) {
                await User.create(userData);
                console.log(`✅ Created user: ${userData.username} (${userData.phone})`);
            } else {
                console.log(`⚠️  User already exists: ${userData.username} (${userData.phone})`);
            }
        }

        console.log('\n🎉 Seed operation completed!');
        console.log('\n📋 Test Login Credentials:');
        console.log('1. Phone: 9876543210, Password: password123 (John Doe - User)');
        console.log('2. Phone: 9876543211, Password: password123 (Jane Smith - User)');
        console.log('3. Phone: 9876543212, Password: password123 (Bob Johnson - Retailer)');
        
    } catch (error) {
        console.error('❌ Error seeding users:', error);
        throw error;
    }
};

const runSeed = async () => {
    try {
        console.log('🚀 Starting seed process...');
        
        // Initialize database connection
        await connectDB();
        
        // Run seed
        await seedUsers();
        
        console.log('✅ Seed process completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('💥 Seed failed:', error);
        process.exit(1);
    }
};

// Execute the seed when this file is run directly
runSeed();