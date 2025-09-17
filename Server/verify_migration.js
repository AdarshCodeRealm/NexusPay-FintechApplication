import { sequelize } from './src/db/index.js';

/**
 * Verify Transaction Enhancement Migration
 * Check if all new columns were added successfully
 */
async function verifyMigration() {
  try {
    console.log('🔍 Verifying Transaction Enhancement Migration...');
    console.log('================================================');

    // Check if new columns exist in transactions table
    console.log('\n📋 Checking for new columns in transactions table...');
    
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'transactions' 
      AND TABLE_SCHEMA = DATABASE()
      AND COLUMN_NAME IN ('ledger_date', 'user_code', 'ledger_type', 'remarks', 'debit_amount', 'credit_amount')
      ORDER BY COLUMN_NAME
    `);

    const expectedColumns = ['ledger_date', 'user_code', 'ledger_type', 'remarks', 'debit_amount', 'credit_amount'];
    const foundColumns = columns.map(col => col.COLUMN_NAME);

    console.log('\n📊 Column Check Results:');
    expectedColumns.forEach(expectedCol => {
      const found = foundColumns.includes(expectedCol);
      console.log(`   ${found ? '✅' : '❌'} ${expectedCol}: ${found ? 'EXISTS' : 'MISSING'}`);
    });

    if (foundColumns.length === expectedColumns.length) {
      console.log('\n🎉 All new columns found successfully!');
      
      // Show column details
      console.log('\n📝 Column Details:');
      columns.forEach(col => {
        console.log(`   ${col.COLUMN_NAME}: ${col.DATA_TYPE} ${col.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
      });

    } else {
      console.log('\n⚠️ Some columns are missing. Migration may not have completed successfully.');
      const missingColumns = expectedColumns.filter(col => !foundColumns.includes(col));
      console.log('Missing columns:', missingColumns.join(', '));
    }

    // Test a query to make sure the API will work
    console.log('\n🧪 Testing transaction query with new columns...');
    try {
      const [testResults] = await sequelize.query(`
        SELECT 
          id, 
          transaction_type, 
          amount, 
          ledger_date, 
          user_code, 
          ledger_type, 
          remarks, 
          debit_amount, 
          credit_amount,
          created_at
        FROM transactions 
        ORDER BY created_at DESC
        LIMIT 3
      `);

      console.log(`✅ Query successful! Found ${testResults.length} transactions.`);
      
      if (testResults.length > 0) {
        console.log('\n📋 Sample data:');
        testResults.forEach((row, index) => {
          console.log(`   ${index + 1}. ID: ${row.id}`);
          console.log(`      Type: ${row.transaction_type}`);
          console.log(`      Amount: ₹${row.amount}`);
          console.log(`      Ledger Type: ${row.ledger_type || 'NULL'}`);
          console.log(`      User Code: ${row.user_code || 'NULL'}`);
          console.log(`      Remarks: ${row.remarks ? row.remarks.substring(0, 50) + '...' : 'NULL'}`);
          console.log('      ---');
        });
      } else {
        console.log('   ℹ️ No transactions found (this is okay for new installations)');
      }

    } catch (queryError) {
      console.error('❌ Test query failed:', queryError.message);
      console.log('   This means the API will likely return 500 errors');
      return false;
    }

    // Check indexes
    console.log('\n🔍 Checking indexes...');
    try {
      const [indexes] = await sequelize.query(`
        SHOW INDEX FROM transactions 
        WHERE Key_name LIKE 'idx_transactions_%'
      `);
      
      console.log(`✅ Found ${indexes.length} custom indexes on transactions table`);
      indexes.forEach(idx => {
        console.log(`   📌 ${idx.Key_name} on column: ${idx.Column_name}`);
      });
    } catch (indexError) {
      console.log('ℹ️ Could not check indexes (this is not critical)');
    }

    console.log('\n===============================================');
    
    if (foundColumns.length === expectedColumns.length) {
      console.log('🎉 MIGRATION VERIFICATION SUCCESSFUL! 🎉');
      console.log('✅ All required columns are present');
      console.log('✅ Database queries are working');
      console.log('✅ Your API should now work without 500 errors');
      
      // Try to restart the server suggestion
      console.log('\n💡 Next steps:');
      console.log('   1. Restart your server if it\'s running');
      console.log('   2. Test the API endpoint: /api/v1/wallet/transaction-history');
      console.log('   3. The 500 error should be resolved');
      
      return true;
    } else {
      console.log('❌ MIGRATION VERIFICATION FAILED');
      console.log('   Some required columns are missing');
      console.log('   You may need to run the migration again');
      return false;
    }

  } catch (error) {
    console.error('💥 Verification failed:', error);
    console.error('Error details:', error.message);
    return false;
  } finally {
    // Close database connection
    await sequelize.close();
  }
}

// Run verification
verifyMigration()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });