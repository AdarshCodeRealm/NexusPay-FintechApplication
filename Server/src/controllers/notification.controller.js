import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";
import { Op } from "sequelize";

// Get all notifications for a user
const getNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    
    if (type) {
        whereClause.type = type;
    }
    
    if (isRead !== undefined) {
        whereClause.isRead = isRead === 'true';
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);
    const unreadCount = await Notification.count({
        where: { userId: req.user.id, isRead: false }
    });

    return res.status(200).json(
        new ApiResponse(200, {
            notifications,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                pages: totalPages
            },
            unreadCount
        }, "Notifications fetched successfully")
    );
});

// Mark a notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
        where: { 
            id: notificationId, 
            userId: req.user.id 
        }
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    await notification.update({ isRead: true });

    return res.status(200).json(
        new ApiResponse(200, notification, "Notification marked as read")
    );
});

// Mark all notifications as read
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const [updatedCount] = await Notification.update(
        { isRead: true },
        { 
            where: { 
                userId: req.user.id, 
                isRead: false 
            } 
        }
    );

    return res.status(200).json(
        new ApiResponse(200, { updatedCount }, "All notifications marked as read")
    );
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
        where: { 
            id: notificationId, 
            userId: req.user.id 
        }
    });

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    await notification.destroy();

    return res.status(200).json(
        new ApiResponse(200, null, "Notification deleted successfully")
    );
});

// Get unread notification count
const getUnreadCount = asyncHandler(async (req, res) => {
    const unreadCount = await Notification.count({
        where: { userId: req.user.id, isRead: false }
    });

    return res.status(200).json(
        new ApiResponse(200, { unreadCount }, "Unread count fetched successfully")
    );
});

// Create a new notification (internal helper function)
const createNotification = async (userId, notificationData) => {
    try {
        const notification = await Notification.create({
            userId,
            ...notificationData
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

// Create notification for money received
const createMoneyReceivedNotification = async (recipientId, senderName, amount, transactionId) => {
    return await createNotification(recipientId, {
        title: 'Money Received',
        message: `You received ₹${amount.toLocaleString()} from ${senderName}`,
        type: 'transaction',
        metadata: {
            transactionId,
            senderName,
            amount,
            transactionType: 'money_received'
        }
    });
};

// Create notification for money sent
const createMoneySentNotification = async (senderId, recipientName, amount, transactionId) => {
    return await createNotification(senderId, {
        title: 'Payment Successful',
        message: `You sent ₹${amount.toLocaleString()} to ${recipientName}`,
        type: 'success',
        metadata: {
            transactionId,
            recipientName,
            amount,
            transactionType: 'money_sent'
        }
    });
};

// Create notification for wallet topup
const createWalletTopupNotification = async (userId, amount, paymentMethod) => {
    return await createNotification(userId, {
        title: 'Wallet Topup Successful',
        message: `Your wallet has been credited with ₹${amount.toLocaleString()} via ${paymentMethod}`,
        type: 'success',
        metadata: {
            amount,
            paymentMethod,
            transactionType: 'wallet_topup'
        }
    });
};

// Create notification for bill payment
const createBillPaymentNotification = async (userId, billType, amount, operator) => {
    return await createNotification(userId, {
        title: 'Bill Payment Successful',
        message: `Your ${billType} bill of ₹${amount.toLocaleString()} has been paid to ${operator}`,
        type: 'success',
        metadata: {
            billType,
            amount,
            operator,
            transactionType: 'bill_payment'
        }
    });
};

// Create KYC status notification
const createKYCNotification = async (userId, status, message) => {
    let title = 'KYC Update';
    let type = 'info';
    
    switch (status) {
        case 'approved':
            title = 'KYC Approved';
            type = 'success';
            break;
        case 'rejected':
            title = 'KYC Rejected';
            type = 'error';
            break;
        case 'submitted':
            title = 'KYC Under Review';
            type = 'info';
            break;
    }

    return await createNotification(userId, {
        title,
        message,
        type,
        metadata: {
            kycStatus: status,
            notificationType: 'kyc_update'
        }
    });
};

// Create security alert notification
const createSecurityAlertNotification = async (userId, alertType, message) => {
    return await createNotification(userId, {
        title: 'Security Alert',
        message,
        type: 'warning',
        metadata: {
            alertType,
            notificationType: 'security_alert'
        }
    });
};

export {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    getUnreadCount,
    createNotification,
    createMoneyReceivedNotification,
    createMoneySentNotification,
    createWalletTopupNotification,
    createBillPaymentNotification,
    createKYCNotification,
    createSecurityAlertNotification
};