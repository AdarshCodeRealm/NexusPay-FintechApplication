import { diagnoseAndFixPayment } from './diagnosticPayment.js';

// Run diagnostic and fix for 100 Rs payment
console.log('🚀 Running Payment Diagnostic and Fix...');
console.log('======================================');

diagnoseAndFixPayment(100)
  .then(result => {
    console.log('\n📋 DIAGNOSTIC RESULTS:');
    console.log('======================');
    
    if (result.error) {
      console.error('❌ Error:', result.error);
      return;
    }
    
    if (result.diagnostic) {
      console.log('📊 Diagnostic Status:', result.diagnostic.status);
      
      if (result.diagnostic.status === 'wallet_update_missing') {
        console.log('🔍 Found missing wallet update for successful payment');
      }
      
      if (result.diagnostic.payments) {
        console.log(`💳 Found ${result.diagnostic.payments.length} recent payments`);
      }
    }
    
    if (result.fix) {
      console.log('\n🔧 FIX RESULTS:');
      console.log('===============');
      console.log('✅ Status:', result.fix.status);
      
      if (result.fix.status === 'fixed') {
        console.log(`💰 Old Balance: ₹${result.fix.oldBalance}`);
        console.log(`💰 New Balance: ₹${result.fix.newBalance}`);
        console.log(`💸 Amount Added: ₹${result.fix.amount}`);
        console.log('\n🎉 YOUR WALLET HAS BEEN UPDATED! 🎉');
      } else if (result.fix.status === 'already_updated') {
        console.log('✅ Wallet was already updated correctly');
      }
    }
    
    console.log('\n✅ Process completed!');
  })
  .catch(error => {
    console.error('💥 Process failed:', error);
  });