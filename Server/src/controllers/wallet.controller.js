import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { User, Transaction } from "../models/index.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import { sequelize } from "../db/index.js";
import { Op } from "sequelize";
import { generateEnhancedTransactionId, generateReferenceId } from "../utils/transactionUtils.js";

const getWalletBalance = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: ['walletBalance', 'walletFrozenBalance']
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            balance: parseFloat(user.walletBalance),
            frozenBalance: parseFloat(user.walletFrozenBalance)
        }, "Wallet balance fetched successfully")
    );
});

const addMoneyToWallet = asyncHandler(async (req, res) => {
    const { amount, paymentMethod, paymentDetails } = req.body;

    if (!amount || amount <= 0) {
        throw new ApiError(400, "Valid amount is required");
    }

    const transaction = await sequelize.transaction();

    try {
        const user = await User.findByPk(req.user.id, { transaction });
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const balanceBefore = parseFloat(user.walletBalance);
        const balanceAfter = balanceBefore + parseFloat(amount);

        // Create transaction record using correct schema
        const walletTransaction = await Transaction.create({
            userId: user.id,
            transactionType: 'deposit', // Use correct enum value
            amount: parseFloat(amount),
            openingBalance: balanceBefore, // Use correct field name
            closingBalance: balanceAfter, // Use correct field name
            status: 'completed',
            description: `Wallet topup via ${paymentMethod}`,
            referenceNumber: generateReferenceId(), // Use correct field name
            bankReference: paymentDetails?.gatewayTransactionId, // Use correct field name
            paymentMethod: paymentMethod,
            transactionMetadata: JSON.stringify({ paymentMethod, paymentDetails }) // Use correct field name
        }, { transaction });

        // Update user wallet balance
        await user.update({
            walletBalance: balanceAfter
        }, { transaction });

        await transaction.commit();

        return res.status(200).json(
            new ApiResponse(200, {
                transaction: walletTransaction,
                newBalance: balanceAfter
            }, "Money added to wallet successfully")
        );
    } catch (error) {
        await transaction.rollback();
        throw new ApiError(500, error.message || "Failed to add money to wallet");
    }
});

const withdrawMoney = asyncHandler(async (req, res) => {
    const { amount, bankAccount, ifscCode, accountHolderName } = req.body;

    if (!amount || amount <= 0) {
        throw new ApiError(400, "Valid amount is required");
    }

    if (!bankAccount || !ifscCode || !accountHolderName) {
        throw new ApiError(400, "Bank details are required");
    }

    const dbTransaction = await sequelize.transaction();

    try {
        const user = await User.findByPk(req.user.id, { transaction: dbTransaction });
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const currentBalance = parseFloat(user.walletBalance);
        
        if (currentBalance < amount) {
            throw new ApiError(400, "Insufficient wallet balance");
        }

        const balanceAfter = currentBalance - parseFloat(amount);

        // Create withdrawal transaction using correct schema
        const withdrawalTransaction = await Transaction.create({
            userId: user.id,
            transactionType: 'withdrawal', // Use correct enum value
            amount: -parseFloat(amount),
            openingBalance: currentBalance, // Use correct field name
            closingBalance: balanceAfter, // Use correct field name
            status: 'pending',
            description: `Withdrawal to ${bankAccount}`,
            referenceNumber: generateReferenceId(), // Use correct field name
            beneficiaryAccount: bankAccount, // Use correct field name
            beneficiaryIfsc: ifscCode, // Use correct field name
            beneficiaryName: accountHolderName, // Use correct field name
            transactionMetadata: JSON.stringify({ bankAccount, ifscCode, accountHolderName }) // Use correct field name
        }, { transaction: dbTransaction });

        // Update user wallet balance
        await user.update({
            walletBalance: balanceAfter
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        return res.status(200).json(
            new ApiResponse(200, {
                transaction: withdrawalTransaction,
                newBalance: balanceAfter
            }, "Withdrawal request submitted successfully")
        );
    } catch (error) {
        await dbTransaction.rollback();
        throw new ApiError(500, error.message || "Failed to process withdrawal");
    }
});

const transferMoney = asyncHandler(async (req, res) => {
    const { recipientPhone, amount, description, mpin } = req.body;

    if (!recipientPhone || !amount || amount <= 0) {
        throw new ApiError(400, "Recipient phone and valid amount are required");
    }

    // Add MPIN validation for transfers
    if (!mpin) {
        throw new ApiError(400, "MPIN is required for money transfers");
    }

    if (mpin.length !== 4) {
        throw new ApiError(400, "MPIN must be 4 digits");
    }

    const dbTransaction = await sequelize.transaction();

    try {
        // Get sender with lock to prevent concurrent transactions
        const sender = await User.findByPk(req.user.id, { 
            transaction: dbTransaction,
            lock: dbTransaction.LOCK.UPDATE 
        });
        
        if (!sender) {
            throw new ApiError(404, "Sender not found");
        }

        // MPIN verification - In production, this should be hashed and compared securely
        // For demo purposes, we'll use a simple comparison (should be replaced with proper authentication)
        const validMpin = "1234"; // In production, this should be stored as a hash in the user table
        if (mpin !== validMpin) {
            console.log(`❌ INVALID MPIN ATTEMPT:`, {
                userId: sender.id,
                phone: sender.phone,
                attemptedMpin: mpin,
                timestamp: new Date().toISOString(),
                ipAddress: req.ip
            });
            throw new ApiError(401, "Invalid MPIN. Please try again.");
        }

        console.log(`✅ MPIN VERIFIED for user:`, sender.phone);

        // Get recipient with lock
        const recipient = await User.findOne({ 
            where: { phone: recipientPhone }, 
            transaction: dbTransaction,
            lock: dbTransaction.LOCK.UPDATE 
        });

        if (!recipient) {
            throw new ApiError(404, "Recipient not found with this phone number");
        }

        if (sender.id === recipient.id) {
            throw new ApiError(400, "Cannot transfer money to yourself");
        }

        // Check account status
        if (sender.accountStatus !== 'active') {
            throw new ApiError(403, "Your account is not active for transfers");
        }

        if (recipient.accountStatus !== 'active') {
            throw new ApiError(403, "Recipient account is not active");
        }

        const senderBalance = parseFloat(sender.walletBalance || 0);
        const transferAmount = parseFloat(amount);
        
        if (senderBalance < transferAmount) {
            throw new ApiError(400, `Insufficient wallet balance. Available: ₹${senderBalance}, Required: ₹${transferAmount}`);
        }

        // Basic transfer limits for simple transfers
        const MAX_SIMPLE_TRANSFER = 10000; // ₹10,000 per transaction for MPIN transfers
        if (transferAmount > MAX_SIMPLE_TRANSFER) {
            throw new ApiError(400, `Transfer amount cannot exceed ₹${MAX_SIMPLE_TRANSFER} for MPIN transfers. Use secure transfer for higher amounts.`);
        }

        // Calculate new balances
        const senderBalanceAfter = senderBalance - transferAmount;
        const recipientBalanceBefore = parseFloat(recipient.walletBalance || 0);
        const recipientBalanceAfter = recipientBalanceBefore + transferAmount;

        const baseReferenceId = `TXN${Date.now()}`;
        const senderReferenceId = `${baseReferenceId}_S${Math.floor(Math.random() * 1000)}`;
        const recipientReferenceId = `${baseReferenceId}_R${Math.floor(Math.random() * 1000)}`;

        console.log(`💸 MPIN TRANSFER INITIATED:`, {
            senderId: sender.id,
            senderPhone: sender.phone,
            recipientId: recipient.id, 
            recipientPhone: recipient.phone,
            amount: transferAmount,
            senderBalanceBefore: senderBalance,
            senderBalanceAfter: senderBalanceAfter,
            recipientBalanceBefore,
            recipientBalanceAfter,
            senderReferenceId,
            recipientReferenceId,
            timestamp: new Date().toISOString()
        });

        // Create sender transaction (debit)
        const senderTransaction = await Transaction.create({
            userId: sender.id,
            transactionType: 'transfer',
            amount: -transferAmount,
            openingBalance: senderBalance,
            closingBalance: senderBalanceAfter,
            status: 'completed',
            description: description || `Transfer to ${recipientPhone}`,
            referenceNumber: senderReferenceId,
            beneficiaryName: recipient.fullName,
            beneficiaryAccount: recipientPhone,
            transactionMetadata: JSON.stringify({ 
                transferType: 'debit', 
                recipientPhone, 
                recipientId: recipient.id,
                authMethod: 'mpin',
                ipAddress: req.ip,
                timestamp: new Date().toISOString(),
                relatedTransactionRef: recipientReferenceId
            })
        }, { transaction: dbTransaction });

        // Create recipient transaction (credit)
        const recipientTransaction = await Transaction.create({
            userId: recipient.id,
            transactionType: 'transfer',
            amount: transferAmount,
            openingBalance: recipientBalanceBefore,
            closingBalance: recipientBalanceAfter,
            status: 'completed',
            description: description || `Transfer from ${sender.phone}`,
            referenceNumber: recipientReferenceId,
            beneficiaryName: sender.fullName,
            beneficiaryAccount: sender.phone,
            transactionMetadata: JSON.stringify({ 
                transferType: 'credit', 
                senderPhone: sender.phone, 
                senderId: sender.id,
                ipAddress: req.ip,
                timestamp: new Date().toISOString(),
                relatedTransactionRef: senderReferenceId
            })
        }, { transaction: dbTransaction });

        // Update sender balance
        const senderUpdateResult = await sender.update({ 
            walletBalance: senderBalanceAfter,
            lastTransactionDate: new Date()
        }, { transaction: dbTransaction });

        // Update recipient balance  
        const recipientUpdateResult = await recipient.update({ 
            walletBalance: recipientBalanceAfter,
            lastTransactionDate: new Date()
        }, { transaction: dbTransaction });

        console.log(`💰 BALANCE UPDATES:`, {
            senderUpdated: senderUpdateResult ? 'SUCCESS' : 'FAILED',
            recipientUpdated: recipientUpdateResult ? 'SUCCESS' : 'FAILED',
            senderNewBalance: senderBalanceAfter,
            recipientNewBalance: recipientBalanceAfter
        });

        await dbTransaction.commit();

        console.log(`✅ MPIN TRANSFER COMPLETED SUCCESSFULLY:`, {
            senderReferenceId,
            recipientReferenceId,
            senderFinalBalance: senderBalanceAfter,
            recipientFinalBalance: recipientBalanceAfter,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json(
            new ApiResponse(200, {
                referenceId: senderReferenceId, // Return sender reference for frontend
                senderNewBalance: senderBalanceAfter,
                transferAmount,
                recipient: {
                    name: recipient.fullName,
                    phone: recipient.phone
                },
                transactionDetails: {
                    senderTransactionId: senderTransaction.id,
                    recipientTransactionId: recipientTransaction.id,
                    senderReferenceId,
                    recipientReferenceId,
                    timestamp: new Date().toISOString()
                }
            }, "Money transferred successfully")
        );
    } catch (error) {
        await dbTransaction.rollback();
        
        console.error(`❌ MPIN TRANSFER FAILED:`, {
            senderId: req.user?.id,
            recipientPhone,
            amount,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
        });
        
        throw new ApiError(500, error.message || "Failed to transfer money");
    }
});

const secureTransferMoney = asyncHandler(async (req, res) => {
    const { recipientPhone, amount, description, otpCode, transferPin } = req.body;

    // Enhanced validation
    if (!recipientPhone || !amount || amount <= 0) {
        throw new ApiError(400, "Recipient phone and valid amount are required");
    }

    if (!otpCode) {
        throw new ApiError(400, "OTP verification is required for transfers");
    }

    const transferAmount = parseFloat(amount);

    // Security checks: Amount limits
    const MAX_TRANSFER_AMOUNT = 50000; // ₹50,000 per transaction
    const MIN_TRANSFER_AMOUNT = 1; // ₹1 minimum

    if (transferAmount > MAX_TRANSFER_AMOUNT) {
        throw new ApiError(400, `Transfer amount cannot exceed ₹${MAX_TRANSFER_AMOUNT}`);
    }

    if (transferAmount < MIN_TRANSFER_AMOUNT) {
        throw new ApiError(400, `Transfer amount must be at least ₹${MIN_TRANSFER_AMOUNT}`);
    }

    const dbTransaction = await sequelize.transaction();

    try {
        // Get sender with lock to prevent concurrent transactions
        const sender = await User.findByPk(req.user.id, { 
            transaction: dbTransaction,
            lock: dbTransaction.LOCK.UPDATE 
        });

        if (!sender) {
            throw new ApiError(404, "Sender not found");
        }

        // Verify OTP for transfer security
        if (!sender.otpCode || sender.otpCode !== otpCode || sender.otpExpiry < new Date()) {
            throw new ApiError(401, "Invalid or expired OTP for transfer");
        }

        // Check if account is active and not suspended
        if (sender.accountStatus !== 'active') {
            throw new ApiError(403, "Account is not active for transfers");
        }

        // Get recipient
        const recipient = await User.findOne({ 
            where: { phone: recipientPhone }, 
            transaction: dbTransaction 
        });

        if (!recipient) {
            throw new ApiError(404, "Recipient not found with this phone number");
        }

        if (recipient.accountStatus !== 'active') {
            throw new ApiError(403, "Recipient account is not active");
        }

        if (sender.id === recipient.id) {
            throw new ApiError(400, "Cannot transfer money to yourself");
        }

        // Daily and monthly limit checks
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Calculate daily spent
        const dailyTransfers = await Transaction.sum('amount', {
            where: {
                userId: sender.id,
                transactionType: 'transfer',
                amount: { [Op.lt]: 0 }, // Only outgoing transfers
                createdAt: { [Op.gte]: today },
                status: 'completed'
            },
            transaction: dbTransaction
        });

        // Calculate monthly spent
        const monthlyTransfers = await Transaction.sum('amount', {
            where: {
                userId: sender.id,
                transactionType: 'transfer',
                amount: { [Op.lt]: 0 }, // Only outgoing transfers
                createdAt: { [Op.gte]: startOfMonth },
                status: 'completed'
            },
            transaction: dbTransaction
        });

        const dailySpent = Math.abs(dailyTransfers || 0);
        const monthlySpent = Math.abs(monthlyTransfers || 0);
        const dailyLimit = parseFloat(sender.walletDailyLimit || 50000);
        const monthlyLimit = parseFloat(sender.walletMonthlyLimit || 1000000);

        if (dailySpent + transferAmount > dailyLimit) {
            throw new ApiError(400, `Daily transfer limit of ₹${dailyLimit} exceeded. Current spent: ₹${dailySpent}`);
        }

        if (monthlySpent + transferAmount > monthlyLimit) {
            throw new ApiError(400, `Monthly transfer limit of ₹${monthlyLimit} exceeded. Current spent: ₹${monthlySpent}`);
        }

        // Fraud detection: Check for rapid multiple transfers
        const recentTransfers = await Transaction.count({
            where: {
                userId: sender.id,
                transactionType: 'transfer',
                createdAt: { [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
                status: 'completed'
            },
            transaction: dbTransaction
        });

        if (recentTransfers >= 5) {
            throw new ApiError(429, "Too many transfers in a short time. Please wait before making another transfer.");
        }

        // Balance validation
        const senderBalance = parseFloat(sender.walletBalance);
        const frozenBalance = parseFloat(sender.walletFrozenBalance || 0);
        const availableBalance = senderBalance - frozenBalance;
        
        if (availableBalance < transferAmount) {
            throw new ApiError(400, `Insufficient available balance. Available: ₹${availableBalance}, Required: ₹${transferAmount}`);
        }

        // Calculate new balances
        const senderBalanceAfter = senderBalance - transferAmount;
        const recipientBalanceBefore = parseFloat(recipient.walletBalance);
        const recipientBalanceAfter = recipientBalanceBefore + transferAmount;

        const referenceId = generateReferenceId();

        // Enhanced logging for security audit
        console.log(`🔒 SECURE TRANSFER INITIATED:`, {
            senderId: sender.id,
            senderPhone: sender.phone,
            recipientId: recipient.id,
            recipientPhone: recipient.phone,
            amount: transferAmount,
            referenceId,
            timestamp: new Date().toISOString(),
            dailySpent,
            monthlySpent,
            availableBalance
        });

        // Create sender transaction (debit) with enhanced metadata
        const senderTransaction = await Transaction.create({
            userId: sender.id,
            transactionType: 'transfer',
            amount: -transferAmount,
            openingBalance: senderBalance,
            closingBalance: senderBalanceAfter,
            status: 'completed',
            description: description || `Secure transfer to ${recipientPhone}`,
            referenceNumber: referenceId,
            beneficiaryName: recipient.fullName,
            beneficiaryAccount: recipientPhone,
            transactionMetadata: JSON.stringify({ 
                transferType: 'debit', 
                recipientPhone, 
                recipientId: recipient.id,
                securityLevel: 'enhanced',
                otpVerified: true,
                ipAddress: req.ip,
                userAgent: req.get('User-Agent'),
                dailySpentBefore: dailySpent,
                monthlySpentBefore: monthlySpent
            })
        }, { transaction: dbTransaction });

        // Create recipient transaction (credit) with enhanced metadata
        const recipientTransaction = await Transaction.create({
            userId: recipient.id,
            transactionType: 'transfer',
            amount: transferAmount,
            openingBalance: recipientBalanceBefore,
            closingBalance: recipientBalanceAfter,
            status: 'completed',
            description: description || `Secure transfer from ${sender.phone}`,
            referenceNumber: referenceId,
            beneficiaryName: sender.fullName,
            beneficiaryAccount: sender.phone,
            transactionMetadata: JSON.stringify({ 
                transferType: 'credit', 
                senderPhone: sender.phone, 
                senderId: sender.id,
                securityLevel: 'enhanced',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            })
        }, { transaction: dbTransaction });

        // Update balances atomically
        await sender.update({ 
            walletBalance: senderBalanceAfter,
            dailySpent: dailySpent + transferAmount,
            monthlySpent: monthlySpent + transferAmount,
            lastTransactionDate: new Date()
        }, { transaction: dbTransaction });

        await recipient.update({ 
            walletBalance: recipientBalanceAfter,
            lastTransactionDate: new Date()
        }, { transaction: dbTransaction });

        // Clear OTP after successful transfer
        await sender.update({
            otpCode: null,
            otpExpiry: null
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        // Success logging for audit trail
        console.log(`✅ SECURE TRANSFER COMPLETED:`, {
            referenceId,
            senderFinalBalance: senderBalanceAfter,
            recipientFinalBalance: recipientBalanceAfter,
            timestamp: new Date().toISOString()
        });

        return res.status(200).json(
            new ApiResponse(200, {
                referenceId,
                senderNewBalance: senderBalanceAfter,
                transferAmount,
                recipient: {
                    name: recipient.fullName,
                    phone: recipient.phone
                },
                transactionDetails: {
                    senderTransactionId: senderTransaction.id,
                    recipientTransactionId: recipientTransaction.id,
                    timestamp: new Date().toISOString()
                }
            }, "Secure money transfer completed successfully")
        );
    } catch (error) {
        await dbTransaction.rollback();
        
        // Enhanced error logging for security monitoring
        console.error(`❌ SECURE TRANSFER FAILED:`, {
            senderId: req.user?.id,
            recipientPhone,
            amount: transferAmount,
            error: error.message,
            timestamp: new Date().toISOString(),
            ipAddress: req.ip
        });
        
        throw new ApiError(500, error.message || "Failed to complete secure transfer");
    }
});

// Generate and send OTP for transfer verification
const generateTransferOTP = asyncHandler(async (req, res) => {
    const { recipientPhone, amount } = req.body;

    if (!recipientPhone || !amount) {
        throw new ApiError(400, "Recipient phone and amount are required to generate OTP");
    }

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Check if recipient exists
    const recipient = await User.findOne({ where: { phone: recipientPhone } });
    if (!recipient) {
        throw new ApiError(404, "Recipient not found with this phone number");
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await user.update({
        otpCode: otp,
        otpExpiry: otpExpiry
    });

    // Log OTP generation for security
    console.log(`🔐 TRANSFER OTP GENERATED:`, {
        userId: user.id,
        phone: user.phone,
        recipientPhone,
        amount,
        otp: process.env.NODE_ENV === 'development' ? otp : '******',
        timestamp: new Date().toISOString()
    });

    return res.status(200).json(
        new ApiResponse(200, {
            message: "OTP sent successfully for transfer verification",
            expiryTime: otpExpiry,
            // In development, return OTP for testing
            otp: process.env.NODE_ENV === 'development' ? otp : undefined
        }, "Transfer OTP generated successfully")
    );
});

// Get user's transfer limits and current usage
const getTransferLimits = asyncHandler(async (req, res) => {
    const user = await User.findByPk(req.user.id, {
        attributes: ['walletDailyLimit', 'walletMonthlyLimit', 'dailySpent', 'monthlySpent', 'walletBalance', 'walletFrozenBalance']
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Calculate actual daily and monthly spent from transactions
    const dailySpent = await Transaction.sum('amount', {
        where: {
            userId: req.user.id,
            transactionType: 'transfer',
            amount: { [Op.lt]: 0 }, // Only outgoing transfers
            createdAt: { [Op.gte]: today },
            status: 'completed'
        }
    }) || 0;

    const monthlySpent = await Transaction.sum('amount', {
        where: {
            userId: req.user.id,
            transactionType: 'transfer',
            amount: { [Op.lt]: 0 }, // Only outgoing transfers
            createdAt: { [Op.gte]: startOfMonth },
            status: 'completed'
        }
    }) || 0;

    const dailyLimit = parseFloat(user.walletDailyLimit || 50000);
    const monthlyLimit = parseFloat(user.walletMonthlyLimit || 1000000);
    const availableBalance = parseFloat(user.walletBalance) - parseFloat(user.walletFrozenBalance || 0);

    return res.status(200).json(
        new ApiResponse(200, {
            limits: {
                dailyLimit,
                monthlyLimit,
                maxTransferAmount: 50000,
                minTransferAmount: 1
            },
            usage: {
                dailySpent: Math.abs(dailySpent),
                monthlySpent: Math.abs(monthlySpent),
                dailyRemaining: Math.max(0, dailyLimit - Math.abs(dailySpent)),
                monthlyRemaining: Math.max(0, monthlyLimit - Math.abs(monthlySpent))
            },
            balance: {
                total: parseFloat(user.walletBalance),
                frozen: parseFloat(user.walletFrozenBalance || 0),
                available: availableBalance
            }
        }, "Transfer limits fetched successfully")
    );
});

const mobileRecharge = asyncHandler(async (req, res) => {
    const { operator, circle, number, amount, plan } = req.body;

    if (!operator || !number || !amount || amount <= 0) {
        throw new ApiError(400, "Operator, number, and valid amount are required");
    }

    const dbTransaction = await sequelize.transaction();

    try {
        const user = await User.findByPk(req.user.id, { transaction: dbTransaction });
        
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        const currentBalance = parseFloat(user.walletBalance);
        
        if (currentBalance < amount) {
            throw new ApiError(400, "Insufficient wallet balance");
        }

        const balanceAfter = currentBalance - parseFloat(amount);

        // Create recharge transaction using correct schema
        const rechargeTransaction = await Transaction.create({
            userId: user.id,
            transactionType: 'payment', // Use correct enum value for mobile recharge
            amount: -parseFloat(amount),
            openingBalance: currentBalance, // Use correct field name
            closingBalance: balanceAfter, // Use correct field name
            status: 'completed',
            description: `Mobile recharge for ${number}`,
            referenceNumber: generateReferenceId(), // Use correct field name
            bankReference: `RCH${Date.now()}`, // Use correct field name
            paymentMethod: 'WALLET',
            transactionMetadata: JSON.stringify({ operator, circle, number, plan, service: 'mobile_recharge' }) // Use correct field name
        }, { transaction: dbTransaction });

        // Update user wallet balance
        await user.update({
            walletBalance: balanceAfter
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        return res.status(200).json(
            new ApiResponse(200, {
                transaction: rechargeTransaction,
                newBalance: balanceAfter,
                rechargeStatus: 'success'
            }, "Mobile recharge completed successfully")
        );
    } catch (error) {
        await dbTransaction.rollback();
        throw new ApiError(500, error.message || "Failed to process mobile recharge");
    }
});

const getTransactionHistory = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, type, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    
    if (type) {
        whereClause.transactionType = type; // This is correct as per the model
    }
    
    if (status) {
        whereClause.status = status;
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: { 
            exclude: ['transactionMetadata'] // Exclude metadata to reduce payload size
        }
    });

    const totalPages = Math.ceil(count / limit);

    // Transform transactions to include backward compatibility fields
    const transformedTransactions = transactions.map(transaction => {
        const txnData = transaction.toJSON();
        return {
            ...txnData,
            // Add aliases for frontend compatibility
            type: txnData.transactionType,
            referenceId: txnData.referenceNumber,
            balanceBefore: txnData.openingBalance,
            balanceAfter: txnData.closingBalance
        };
    });

    return res.status(200).json(
        new ApiResponse(200, {
            transactions: transformedTransactions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: totalPages
            }
        }, "Transaction history fetched successfully")
    );
});

export {
    getWalletBalance,
    addMoneyToWallet,
    withdrawMoney,
    transferMoney,
    secureTransferMoney,
    generateTransferOTP,
    getTransferLimits,
    mobileRecharge,
    getTransactionHistory
};