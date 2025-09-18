import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import { User, MoneyRequest, Transaction } from "../models/index.js";
import { sequelize } from "../db/index.js";
import { Op } from "sequelize";
import { generateReferenceId } from "../utils/transactionUtils.js";
import { 
    createNotification,
    createMoneySentNotification,
    createMoneyReceivedNotification 
} from "./notification.controller.js";

// Create a new money request
const createMoneyRequest = asyncHandler(async (req, res) => {
    const { payerPhone, amount, description, expiresIn } = req.body;

    if (!payerPhone || !amount || amount <= 0) {
        throw new ApiError(400, "Payer phone and valid amount are required");
    }

    const requestAmount = parseFloat(amount);
    
    if (requestAmount < 1) {
        throw new ApiError(400, "Minimum request amount is ₹1");
    }

    if (requestAmount > 50000) {
        throw new ApiError(400, "Maximum request amount is ₹50,000");
    }

    try {
        // Find the payer user
        const payer = await User.findOne({ where: { phone: payerPhone } });
        
        if (!payer) {
            throw new ApiError(404, "User not found with this phone number");
        }

        const requester = await User.findByPk(req.user.id);
        
        if (!requester) {
            throw new ApiError(404, "Requester not found");
        }

        if (payer.id === requester.id) {
            throw new ApiError(400, "Cannot request money from yourself");
        }

        // Check if payer's account is active
        if (payer.accountStatus !== 'active') {
            throw new ApiError(403, "Cannot request money from inactive account");
        }

        // Generate unique request reference
        const requestReference = `REQ${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Calculate expiry date (default 7 days if not specified)
        let expiresAt = null;
        if (expiresIn) {
            const hoursToExpire = parseInt(expiresIn);
            if (hoursToExpire > 0 && hoursToExpire <= 720) { // Max 30 days
                expiresAt = new Date(Date.now() + hoursToExpire * 60 * 60 * 1000);
            }
        } else {
            expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days default
        }

        // Create money request
        const moneyRequest = await MoneyRequest.create({
            requesterId: requester.id,
            payerId: payer.id,
            amount: requestAmount,
            description: description || `Money request from ${requester.fullName}`,
            requestReference,
            expiresAt,
            metadata: {
                requesterPhone: requester.phone,
                payerPhone: payer.phone,
                createdAt: new Date().toISOString(),
                ipAddress: req.ip
            }
        });

        // Create notification for the payer
        await createNotification(payer.id, {
            title: 'Money Request Received',
            message: `${requester.fullName} has requested ₹${requestAmount.toLocaleString()} from you`,
            type: 'info',
            metadata: {
                moneyRequestId: moneyRequest.id,
                requestReference,
                requesterName: requester.fullName,
                requesterPhone: requester.phone,
                amount: requestAmount,
                notificationType: 'money_request_received'
            }
        });

        return res.status(201).json(
            new ApiResponse(201, {
                moneyRequest: {
                    id: moneyRequest.id,
                    requestReference,
                    amount: requestAmount,
                    description: moneyRequest.description,
                    status: moneyRequest.status,
                    expiresAt: moneyRequest.expiresAt,
                    payer: {
                        name: payer.fullName,
                        phone: payer.phone
                    }
                }
            }, "Money request created successfully")
        );
    } catch (error) {
        throw new ApiError(500, error.message || "Failed to create money request");
    }
});

// Get money requests (sent and received)
const getMoneyRequests = asyncHandler(async (req, res) => {
    const { type = 'all', status, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    const offset = (page - 1) * limit;

    let whereClause = {};
    let include = [];

    if (type === 'sent') {
        whereClause.requesterId = userId;
        include = [{
            model: User,
            as: 'payer',
            attributes: ['id', 'fullName', 'phone']
        }];
    } else if (type === 'received') {
        whereClause.payerId = userId;
        include = [{
            model: User,
            as: 'requester',
            attributes: ['id', 'fullName', 'phone']
        }];
    } else {
        // Get both sent and received
        whereClause = {
            [Op.or]: [
                { requesterId: userId },
                { payerId: userId }
            ]
        };
        include = [
            {
                model: User,
                as: 'requester',
                attributes: ['id', 'fullName', 'phone']
            },
            {
                model: User,
                as: 'payer',
                attributes: ['id', 'fullName', 'phone']
            }
        ];
    }

    if (status) {
        whereClause.status = status;
    }

    // Auto-expire old pending requests
    await MoneyRequest.update(
        { status: 'expired' },
        {
            where: {
                status: 'pending',
                expiresAt: {
                    [Op.lt]: new Date()
                }
            }
        }
    );

    const { count, rows: requests } = await MoneyRequest.findAndCountAll({
        where: whereClause,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json(
        new ApiResponse(200, {
            requests,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: totalPages
            }
        }, "Money requests fetched successfully")
    );
});

// Pay a money request
const payMoneyRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { mpin } = req.body;

    if (!mpin || mpin.length !== 4) {
        throw new ApiError(400, "Valid 4-digit MPIN is required");
    }

    const dbTransaction = await sequelize.transaction();

    try {
        // Find the money request with associated users
        const moneyRequest = await MoneyRequest.findByPk(requestId, {
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'fullName', 'phone', 'walletBalance']
                },
                {
                    model: User,
                    as: 'payer',
                    attributes: ['id', 'fullName', 'phone', 'walletBalance']
                }
            ],
            transaction: dbTransaction,
            lock: dbTransaction.LOCK.UPDATE
        });

        if (!moneyRequest) {
            await dbTransaction.rollback();
            throw new ApiError(404, "Money request not found");
        }

        // Verify the current user is the payer
        if (moneyRequest.payerId !== req.user.id) {
            await dbTransaction.rollback();
            throw new ApiError(403, "You are not authorized to pay this request");
        }

        // Check if request is still pending
        if (moneyRequest.status !== 'pending') {
            await dbTransaction.rollback();
            throw new ApiError(400, `Cannot pay a ${moneyRequest.status} request`);
        }

        // Check if request has expired
        if (moneyRequest.expiresAt && new Date() > moneyRequest.expiresAt) {
            await moneyRequest.update({ status: 'expired' }, { transaction: dbTransaction });
            await dbTransaction.commit();
            throw new ApiError(400, "This money request has expired");
        }

        const payer = moneyRequest.payer;
        const requester = moneyRequest.requester;
        const requestAmount = parseFloat(moneyRequest.amount);

        // Verify MPIN - For demo purposes, use default MPIN
        // In production, you should add an 'mpin' column to users table and hash it properly
        const defaultMpin = "1234"; // Default MPIN for testing
        if (mpin !== defaultMpin) {
            await dbTransaction.rollback();
            throw new ApiError(401, "Invalid MPIN");
        }

        // Check payer's balance
        const payerBalance = parseFloat(payer.walletBalance || 0);
        if (payerBalance < requestAmount) {
            await dbTransaction.rollback();
            throw new ApiError(400, `Insufficient balance. Available: ₹${payerBalance.toFixed(2)}, Required: ₹${requestAmount.toFixed(2)}`);
        }

        // Calculate new balances
        const payerNewBalance = payerBalance - requestAmount;
        const requesterOldBalance = parseFloat(requester.walletBalance || 0);
        const requesterNewBalance = requesterOldBalance + requestAmount;

        // Generate transaction references
        const payerTxnRef = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
        const requesterTxnRef = `REC${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Create payer transaction (debit)
        const payerTransaction = await Transaction.create({
            userId: payer.id,
            transactionType: 'transfer',
            amount: -requestAmount,
            openingBalance: payerBalance,
            closingBalance: payerNewBalance,
            status: 'completed',
            description: `Payment for money request: ${moneyRequest.description || 'Money Request'}`,
            referenceNumber: payerTxnRef,
            beneficiaryName: requester.fullName,
            beneficiaryAccount: requester.phone,
            transactionMetadata: JSON.stringify({
                transferType: 'debit',
                moneyRequestId: moneyRequest.id,
                requestReference: moneyRequest.requestReference,
                recipientId: requester.id,
                recipientPhone: requester.phone
            })
        }, { transaction: dbTransaction });

        // Create requester transaction (credit)
        const requesterTransaction = await Transaction.create({
            userId: requester.id,
            transactionType: 'transfer',
            amount: requestAmount,
            openingBalance: requesterOldBalance,
            closingBalance: requesterNewBalance,
            status: 'completed',
            description: `Money received from request: ${moneyRequest.description || 'Money Request'}`,
            referenceNumber: requesterTxnRef,
            beneficiaryName: payer.fullName,
            beneficiaryAccount: payer.phone,
            transactionMetadata: JSON.stringify({
                transferType: 'credit',
                moneyRequestId: moneyRequest.id,
                requestReference: moneyRequest.requestReference,
                senderId: payer.id,
                senderPhone: payer.phone
            })
        }, { transaction: dbTransaction });

        // Update user balances
        await User.update(
            { walletBalance: payerNewBalance },
            { where: { id: payer.id }, transaction: dbTransaction }
        );

        await User.update(
            { walletBalance: requesterNewBalance },
            { where: { id: requester.id }, transaction: dbTransaction }
        );

        // Update money request status
        await moneyRequest.update({
            status: 'paid',
            paidAt: new Date(),
            transactionId: payerTransaction.id
        }, { transaction: dbTransaction });

        await dbTransaction.commit();

        console.log(`✅ Money request payment successful:`, {
            requestId: moneyRequest.id,
            reference: moneyRequest.requestReference,
            amount: requestAmount,
            payer: payer.fullName,
            requester: requester.fullName,
            payerNewBalance,
            requesterNewBalance
        });

        // Create notifications after successful payment
        try {
            // Notify the requester
            await createMoneyReceivedNotification(
                requester.id,
                payer.fullName,
                requestAmount,
                requesterTransaction.id
            );

            // Notify the payer
            await createMoneySentNotification(
                payer.id,
                requester.fullName,
                requestAmount,
                payerTransaction.id
            );
        } catch (notificationError) {
            console.error('Failed to create notifications:', notificationError);
            // Don't fail the entire operation for notification errors
        }

        return res.status(200).json(
            new ApiResponse(200, {
                moneyRequest: {
                    id: moneyRequest.id,
                    requestReference: moneyRequest.requestReference,
                    status: 'paid',
                    paidAt: moneyRequest.paidAt
                },
                transaction: {
                    payerTransactionId: payerTransaction.id,
                    requesterTransactionId: requesterTransaction.id,
                    payerReference: payerTxnRef,
                    requesterReference: requesterTxnRef
                },
                balances: {
                    payerNewBalance,
                    requesterNewBalance
                }
            }, "Money request paid successfully")
        );

    } catch (error) {
        if (dbTransaction && !dbTransaction.finished) {
            await dbTransaction.rollback();
        }
        console.error('💥 Money request payment failed:', {
            requestId,
            userId: req.user?.id,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
});

// Decline a money request
const declineMoneyRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;
    const { reason } = req.body;

    try {
        const moneyRequest = await MoneyRequest.findByPk(requestId, {
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'fullName', 'phone']
                }
            ]
        });

        if (!moneyRequest) {
            throw new ApiError(404, "Money request not found");
        }

        // Verify the current user is the payer
        if (moneyRequest.payerId !== req.user.id) {
            throw new ApiError(403, "You are not authorized to decline this request");
        }

        // Check if request is still pending
        if (moneyRequest.status !== 'pending') {
            throw new ApiError(400, `Cannot decline a ${moneyRequest.status} request`);
        }

        // Update request status
        await moneyRequest.update({
            status: 'declined',
            metadata: {
                ...moneyRequest.metadata,
                declinedAt: new Date().toISOString(),
                declineReason: reason || 'No reason provided'
            }
        });

        // Notify the requester
        const payer = await User.findByPk(req.user.id);
        await createNotification(moneyRequest.requesterId, {
            title: 'Money Request Declined',
            message: `${payer.fullName} declined your money request for ₹${moneyRequest.amount.toLocaleString()}`,
            type: 'info',
            metadata: {
                moneyRequestId: moneyRequest.id,
                requestReference: moneyRequest.requestReference,
                payerName: payer.fullName,
                amount: parseFloat(moneyRequest.amount),
                declineReason: reason || 'No reason provided',
                notificationType: 'money_request_declined'
            }
        });

        return res.status(200).json(
            new ApiResponse(200, {
                moneyRequest: {
                    id: moneyRequest.id,
                    requestReference: moneyRequest.requestReference,
                    status: 'declined'
                }
            }, "Money request declined successfully")
        );

    } catch (error) {
        throw new ApiError(500, error.message || "Failed to decline money request");
    }
});

// Cancel a money request (by requester)
const cancelMoneyRequest = asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    try {
        const moneyRequest = await MoneyRequest.findByPk(requestId);

        if (!moneyRequest) {
            throw new ApiError(404, "Money request not found");
        }

        // Verify the current user is the requester
        if (moneyRequest.requesterId !== req.user.id) {
            throw new ApiError(403, "You are not authorized to cancel this request");
        }

        // Check if request is still pending
        if (moneyRequest.status !== 'pending') {
            throw new ApiError(400, `Cannot cancel a ${moneyRequest.status} request`);
        }

        // Update request status
        await moneyRequest.update({
            status: 'cancelled',
            metadata: {
                ...moneyRequest.metadata,
                cancelledAt: new Date().toISOString()
            }
        });

        return res.status(200).json(
            new ApiResponse(200, {
                moneyRequest: {
                    id: moneyRequest.id,
                    requestReference: moneyRequest.requestReference,
                    status: 'cancelled'
                }
            }, "Money request cancelled successfully")
        );

    } catch (error) {
        throw new ApiError(500, error.message || "Failed to cancel money request");
    }
});

// Get money request statistics
const getMoneyRequestStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    try {
        const stats = await Promise.all([
            // Sent requests stats
            MoneyRequest.count({
                where: { requesterId: userId, status: 'pending' }
            }),
            MoneyRequest.count({
                where: { requesterId: userId, status: 'paid' }
            }),
            MoneyRequest.sum('amount', {
                where: { requesterId: userId, status: 'paid' }
            }),
            
            // Received requests stats
            MoneyRequest.count({
                where: { payerId: userId, status: 'pending' }
            }),
            MoneyRequest.count({
                where: { payerId: userId, status: 'paid' }
            }),
            MoneyRequest.sum('amount', {
                where: { payerId: userId, status: 'paid' }
            })
        ]);

        return res.status(200).json(
            new ApiResponse(200, {
                sent: {
                    pending: stats[0] || 0,
                    paid: stats[1] || 0,
                    totalAmountReceived: stats[2] || 0
                },
                received: {
                    pending: stats[3] || 0,
                    paid: stats[4] || 0,
                    totalAmountPaid: stats[5] || 0
                }
            }, "Money request statistics fetched successfully")
        );

    } catch (error) {
        throw new ApiError(500, error.message || "Failed to fetch statistics");
    }
});

export {
    createMoneyRequest,
    getMoneyRequests,
    payMoneyRequest,
    declineMoneyRequest,
    cancelMoneyRequest,
    getMoneyRequestStats
};