// Database Query Script to Check Payment Status
// Run this in your MySQL client or through Node.js

import { sequelize } from '../db/index.js';
import { Payment, User, Transaction } from '../models/index.js';

/**
 * Check payment status and wallet updates from database
 */
export const checkPaymentStatusInDB = async () => {
  try {
    console.log('🔍 CHECKING PAYMENT STATUS AND WALLET UPDATES...\n');
    
    // 1. Get all recent payments with their status
    console.log('📊 RECENT PAYMENTS:');
    const recentPayments = await Payment.findAll({
      attributes: ['id', 'transactionId', 'userId', 'amount', 'status', 'paymentMethod', 'createdAt'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'phone', 'walletBalance'],
        required: false
      }],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    recentPayments.forEach(payment => {
      const statusIcon = payment.status === 'SUCCESS' ? '✅' : payment.status === 'FAILED' ? '❌' : '⏳';
      console.log(`
        ${statusIcon} Payment ID: ${payment.id}
        Transaction ID: ${payment.transactionId}
        User: ${payment.user?.fullName || 'N/A'} (ID: ${payment.userId})
        Amount: ₹${payment.amount}
        Status: ${payment.status}
        Current Wallet Balance: ₹${payment.user?.walletBalance || 'N/A'}
        Created: ${payment.createdAt}
      `);
    });

    // 2. Count payments by status
    console.log('\n📈 PAYMENT STATUS SUMMARY:');
    const statusCounts = await Payment.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['status']
    });

    statusCounts.forEach(stat => {
      console.log(`${stat.status}: ${stat.dataValues.count} payments`);
    });

    // 3. Check for successful payments and their wallet transactions
    console.log('\n💰 SUCCESSFUL PAYMENTS & WALLET TRANSACTIONS:');
    const successfulPayments = await Payment.findAll({
      where: { status: 'SUCCESS' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'walletBalance'],
        required: true
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    for (const payment of successfulPayments) {
      // Check if there's a corresponding wallet transaction
      const walletTransaction = await Transaction.findOne({
        where: {
          externalTransactionId: payment.transactionId,
          type: 'wallet_topup',
          userId: payment.userId
        }
      });

      console.log(`
        🎯 Payment: ${payment.transactionId}
        User: ${payment.user.fullName}
        Payment Amount: ₹${payment.amount}
        Current Wallet Balance: ₹${payment.user.walletBalance}
        Wallet Transaction: ${walletTransaction ? `✅ Found (Status: ${walletTransaction.status})` : '❌ MISSING!'}
        ${!walletTransaction ? '⚠️  ISSUE: Payment successful but no wallet transaction found!' : ''}
      `);
    }

    // 4. Check for successful payments without wallet updates
    console.log('\n🚨 SUCCESSFUL PAYMENTS WITHOUT WALLET UPDATES:');
    const paymentsWithoutWalletUpdate = await Payment.findAll({
      where: { status: 'SUCCESS' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'walletBalance'],
        required: true
      }],
      order: [['createdAt', 'DESC']]
    });

    const problematicPayments = [];
    for (const payment of paymentsWithoutWalletUpdate) {
      const walletTransaction = await Transaction.findOne({
        where: {
          externalTransactionId: payment.transactionId,
          type: 'wallet_topup',
          status: 'completed'
        }
      });

      if (!walletTransaction) {
        problematicPayments.push(payment);
        console.log(`❌ Payment ${payment.transactionId} - Amount: ₹${payment.amount} - User: ${payment.user.fullName} - NO WALLET UPDATE!`);
      }
    }

    if (problematicPayments.length === 0) {
      console.log('✅ All successful payments have corresponding wallet transactions!');
    }

    return {
      recentPayments,
      statusCounts,
      successfulPayments,
      problematicPayments
    };

  } catch (error) {
    console.error('Error checking payment status:', error);
    throw error;
  }
};

/**
 * Fix wallet balance for successful payments that don't have wallet transactions
 */
export const fixWalletBalanceForSuccessfulPayments = async () => {
  const dbTransaction = await sequelize.transaction();
  
  try {
    console.log('🔧 FIXING WALLET BALANCE FOR SUCCESSFUL PAYMENTS...\n');
    
    // Find successful payments without wallet transactions
    const successfulPayments = await Payment.findAll({
      where: { status: 'SUCCESS' },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'walletBalance'],
        required: true
      }],
      transaction: dbTransaction
    });

    const fixedPayments = [];

    for (const payment of successfulPayments) {
      // Check if wallet transaction already exists
      const existingTransaction = await Transaction.findOne({
        where: {
          externalTransactionId: payment.transactionId,
          type: 'wallet_topup',
          userId: payment.userId
        },
        transaction: dbTransaction
      });

      if (!existingTransaction) {
        console.log(`🔧 Fixing payment: ${payment.transactionId} for user: ${payment.user.fullName}`);
        
        // Get current user balance with lock
        const userWithLock = await User.findByPk(payment.userId, {
          transaction: dbTransaction,
          lock: dbTransaction.LOCK.UPDATE
        });

        const balanceBefore = parseFloat(userWithLock.walletBalance) || 0;
        const paymentAmount = parseFloat(payment.amount);
        const balanceAfter = balanceBefore + paymentAmount;

        // Create wallet transaction
        const walletTransaction = await Transaction.create({
          userId: payment.userId,
          type: 'wallet_topup',
          amount: paymentAmount,
          balanceBefore,
          balanceAfter,
          status: 'completed',
          description: `Wallet topup via PhonePe - ₹${paymentAmount} (Retroactively added)`,
          referenceId: `PP_${payment.transactionId}`,
          externalTransactionId: payment.transactionId,
          metadata: { 
            paymentMethod: 'PHONEPE',
            gatewayTransactionId: payment.transactionId,
            retroactivelyAdded: true,
            fixedAt: new Date()
          }
        }, { transaction: dbTransaction });

        // Update user wallet balance
        await User.update(
          { walletBalance: balanceAfter },
          { 
            where: { id: payment.userId },
            transaction: dbTransaction 
          }
        );

        console.log(`✅ Fixed: User ${payment.user.fullName} - Added ₹${paymentAmount} - New balance: ₹${balanceAfter}`);
        
        fixedPayments.push({
          paymentId: payment.transactionId,
          userId: payment.userId,
          userName: payment.user.fullName,
          amount: paymentAmount,
          oldBalance: balanceBefore,
          newBalance: balanceAfter
        });
      }
    }

    await dbTransaction.commit();
    
    console.log(`\n✅ FIXED ${fixedPayments.length} PAYMENTS`);
    fixedPayments.forEach(fix => {
      console.log(`- ${fix.userName}: +₹${fix.amount} (₹${fix.oldBalance} → ₹${fix.newBalance})`);
    });

    return fixedPayments;

  } catch (error) {
    await dbTransaction.rollback();
    console.error('Error fixing wallet balances:', error);
    throw error;
  }
};

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkPaymentStatusInDB().then(() => {
    console.log('\n✅ Payment status check completed!');
    process.exit(0);
  });
}