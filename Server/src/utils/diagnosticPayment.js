import { sequelize } from "../db/index.js";
import { User, Payment, Transaction } from "../models/index.js";

/**
 * Diagnostic script to check payment and wallet update issues
 */
export const diagnosePaymentIssue = async (amount = 100) => {
  try {
    console.log('🔍 Starting Payment Diagnostic...');
    console.log('=====================================');
    
    // 1. Check recent PhonePe payments for the amount
    const recentPayments = await Payment.findAll({
      where: {
        amount: amount,
        paymentMethod: 'PHONEPE'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'phone', 'walletBalance']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    
    console.log(`📊 Found ${recentPayments.length} recent ₹${amount} PhonePe payments:`);
    
    if (recentPayments.length === 0) {
      console.log('❌ No PhonePe payments found for ₹100');
      return { status: 'no_payments_found' };
    }
    
    for (const payment of recentPayments) {
      console.log(`\n💳 Payment ID: ${payment.id}`);
      console.log(`   Transaction ID: ${payment.transactionId}`);
      console.log(`   Status: ${payment.status}`);
      console.log(`   Amount: ₹${payment.amount}`);
      console.log(`   User: ${payment.user?.fullName} (${payment.user?.phone})`);
      console.log(`   Current Wallet Balance: ₹${payment.user?.walletBalance}`);
      console.log(`   Created: ${payment.createdAt}`);
      
      // 2. Check if wallet transaction was created for this payment
      // Using the correct column names from the schema
      const walletTransaction = await Transaction.findOne({
        where: {
          bankReference: payment.transactionId, // Changed from externalTransactionId
          transactionType: 'deposit' // Changed from type: 'wallet_topup'
        }
      });
      
      if (!walletTransaction) {
        console.log('   ❌ No wallet transaction found - THIS IS THE PROBLEM!');
        console.log('   🔧 Need to create wallet transaction and update balance');
        
        // This payment succeeded but wallet wasn't updated
        if (payment.status === 'SUCCESS') {
          return { 
            status: 'wallet_update_missing', 
            payment: payment,
            needsWalletUpdate: true 
          };
        }
      } else {
        console.log(`   ✅ Wallet transaction found: ${walletTransaction.id} - Status: ${walletTransaction.status}`);
        console.log(`   💰 Transaction Amount: ₹${walletTransaction.amount}`);
        console.log(`   🏦 Balance Before: ₹${walletTransaction.openingBalance}`);
        console.log(`   🏦 Balance After: ₹${walletTransaction.closingBalance}`);
      }
    }
    
    // 3. Check for any pending/failed payments that need retry
    const pendingPayments = await Payment.findAll({
      where: {
        status: ['INITIATED', 'PENDING'],
        paymentMethod: 'PHONEPE'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'phone']
        }
      ]
    });
    
    console.log(`\n⏳ Found ${pendingPayments.length} pending payments that may need verification`);
    
    return {
      status: 'diagnostic_complete',
      recentPayments: recentPayments.length,
      pendingPayments: pendingPayments.length,
      payments: recentPayments
    };
    
  } catch (error) {
    console.error('💥 Diagnostic failed:', error);
    return { status: 'diagnostic_failed', error: error.message };
  }
};

/**
 * Fix missing wallet update for successful payment
 */
export const fixMissingWalletUpdate = async (transactionId) => {
  const dbTransaction = await sequelize.transaction();
  
  try {
    console.log(`🔧 Fixing wallet update for transaction: ${transactionId}`);
    
    // 1. Find the payment
    const payment = await Payment.findOne({
      where: { transactionId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'phone', 'walletBalance']
        }
      ],
      transaction: dbTransaction
    });
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status !== 'SUCCESS') {
      throw new Error('Payment is not successful, cannot update wallet');
    }
    
    // 2. Check if wallet transaction already exists using correct column names
    const existingWalletTxn = await Transaction.findOne({
      where: {
        bankReference: transactionId, // Changed from externalTransactionId
        transactionType: 'deposit' // Changed from type: 'wallet_topup'
      },
      transaction: dbTransaction
    });
    
    if (existingWalletTxn) {
      console.log('✅ Wallet transaction already exists, no action needed');
      await dbTransaction.rollback();
      return { status: 'already_updated', transaction: existingWalletTxn };
    }
    
    // 3. Get user with lock
    const user = await User.findByPk(payment.userId, {
      transaction: dbTransaction,
      lock: dbTransaction.LOCK.UPDATE
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // 4. Calculate balance update
    const balanceBefore = parseFloat(user.walletBalance) || 0;
    const transactionAmount = parseFloat(payment.amount);
    const balanceAfter = balanceBefore + transactionAmount;
    
    console.log(`💰 Balance Update: ₹${balanceBefore} + ₹${transactionAmount} = ₹${balanceAfter}`);
    
    // 5. Create wallet transaction using correct schema
    const walletTransaction = await Transaction.create({
      userId: user.id,
      transactionType: 'deposit', // Using correct enum value
      amount: transactionAmount,
      openingBalance: balanceBefore, // Using correct column name
      closingBalance: balanceAfter, // Using correct column name
      status: 'completed',
      description: `Wallet topup via PhonePe (FIXED) - ₹${transactionAmount}`,
      referenceNumber: `PP_FIX_${transactionId}`, // Using correct column name
      bankReference: transactionId, // Using correct column name
      paymentMethod: 'PHONEPE',
      transactionMetadata: JSON.stringify({ // Using correct column name
        paymentMethod: 'PHONEPE',
        gatewayTransactionId: transactionId,
        fixedAt: new Date(),
        originalPaymentId: payment.id
      })
    }, { transaction: dbTransaction });
    
    // 6. Update user balance
    await user.update(
      { walletBalance: balanceAfter },
      { transaction: dbTransaction }
    );
    
    await dbTransaction.commit();
    
    console.log('✅ Wallet update completed successfully!');
    console.log(`📱 User: ${user.fullName}`);
    console.log(`💳 Transaction: ${walletTransaction.id}`);
    console.log(`💰 New Balance: ₹${balanceAfter}`);
    
    return {
      status: 'fixed',
      walletTransaction,
      oldBalance: balanceBefore,
      newBalance: balanceAfter,
      amount: transactionAmount
    };
    
  } catch (error) {
    await dbTransaction.rollback();
    console.error('💥 Fix failed:', error);
    throw error;
  }
};

/**
 * Main diagnostic and fix function
 */
export const diagnoseAndFixPayment = async (amount = 100) => {
  try {
    const diagnostic = await diagnosePaymentIssue(amount);
    
    if (diagnostic.status === 'wallet_update_missing' && diagnostic.needsWalletUpdate) {
      console.log('\n🔧 Attempting to fix wallet update...');
      const fix = await fixMissingWalletUpdate(diagnostic.payment.transactionId);
      return { diagnostic, fix };
    }
    
    return { diagnostic };
  } catch (error) {
    console.error('Diagnostic and fix failed:', error);
    return { error: error.message };
  }
};