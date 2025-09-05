import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { User, Transaction } from "../models/index.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import { sequelize } from "../db/index.js";
import { Op } from "sequelize";

// Helper function to generate unique reference ID
const generateReferenceId = () => {
    return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
};

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

        // Create transaction record
        const walletTransaction = await Transaction.create({
            userId: user.id,
            type: 'wallet_topup',
            amount: parseFloat(amount),
            balanceBefore,
            balanceAfter,
            status: 'completed',
            description: `Wallet topup via ${paymentMethod}`,
            referenceId: generateReferenceId(),
            externalTransactionId: paymentDetails?.gatewayTransactionId,
            metadata: { paymentMethod, paymentDetails }
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

        // Create withdrawal transaction
        const withdrawalTransaction = await Transaction.create({
            userId: user.id,
            type: 'withdrawal',
            amount: -parseFloat(amount),
            balanceBefore: currentBalance,
            balanceAfter,
            status: 'pending',
            description: `Withdrawal to ${bankAccount}`,
            referenceId: generateReferenceId(),
            metadata: { bankAccount, ifscCode, accountHolderName }
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
    const { recipientPhone, amount, description } = req.body;

    if (!recipientPhone || !amount || amount <= 0) {
        throw new ApiError(400, "Recipient phone and valid amount are required");
    }

    const dbTransaction = await sequelize.transaction();

    try {
        const sender = await User.findByPk(req.user.id, { transaction: dbTransaction });
        const recipient = await User.findOne({ 
            where: { phone: recipientPhone }, 
            transaction: dbTransaction 
        });

        if (!sender) {
            throw new ApiError(404, "Sender not found");
        }

        if (!recipient) {
            throw new ApiError(404, "Recipient not found");
        }

        if (sender.id === recipient.id) {
            throw new ApiError(400, "Cannot transfer money to yourself");
        }

        const senderBalance = parseFloat(sender.walletBalance);
        
        if (senderBalance < amount) {
            throw new ApiError(400, "Insufficient wallet balance");
        }

        const senderBalanceAfter = senderBalance - parseFloat(amount);
        const recipientBalanceBefore = parseFloat(recipient.walletBalance);
        const recipientBalanceAfter = recipientBalanceBefore + parseFloat(amount);

        const referenceId = generateReferenceId();

        // Create sender transaction (debit)
        await Transaction.create({
            userId: sender.id,
            recipientId: recipient.id,
            recipientPhone,
            type: 'wallet_transfer',
            amount: -parseFloat(amount),
            balanceBefore: senderBalance,
            balanceAfter: senderBalanceAfter,
            status: 'completed',
            description: description || `Transfer to ${recipientPhone}`,
            referenceId,
            metadata: { transferType: 'debit', recipientPhone }
        }, { transaction: dbTransaction });

        // Create recipient transaction (credit)
        await Transaction.create({
            userId: recipient.id,
            recipientId: sender.id,
            recipientPhone: sender.phone,
            type: 'wallet_transfer',
            amount: parseFloat(amount),
            balanceBefore: recipientBalanceBefore,
            balanceAfter: recipientBalanceAfter,
            status: 'completed',
            description: description || `Transfer from ${sender.phone}`,
            referenceId,
            metadata: { transferType: 'credit', senderPhone: sender.phone }
        }, { transaction: dbTransaction });

        // Update balances
        await sender.update({ walletBalance: senderBalanceAfter }, { transaction: dbTransaction });
        await recipient.update({ walletBalance: recipientBalanceAfter }, { transaction: dbTransaction });

        await dbTransaction.commit();

        return res.status(200).json(
            new ApiResponse(200, {
                referenceId,
                senderNewBalance: senderBalanceAfter,
                transferAmount: amount
            }, "Money transferred successfully")
        );
    } catch (error) {
        await dbTransaction.rollback();
        throw new ApiError(500, error.message || "Failed to transfer money");
    }
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

        // Create recharge transaction
        const rechargeTransaction = await Transaction.create({
            userId: user.id,
            type: 'mobile_recharge',
            amount: -parseFloat(amount),
            balanceBefore: currentBalance,
            balanceAfter,
            status: 'completed',
            description: `Mobile recharge for ${number}`,
            referenceId: generateReferenceId(),
            externalTransactionId: `RCH${Date.now()}`,
            metadata: { operator, circle, number, plan, service: 'mobile_recharge' }
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
        whereClause.type = type;
    }
    
    if (status) {
        whereClause.status = status;
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']],
        attributes: { exclude: ['metadata'] }
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            transactions,
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
    mobileRecharge,
    getTransactionHistory
};