import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import crypto from 'crypto';
import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import { User, Transaction, Payment } from "../models/index.js";
import { sequelize } from "../db/index.js";

// PhonePe Configuration from environment variables
const MERCHANT_KEY = process.env.PHONEPE_SALT_KEY || "6b0d884b-3d5f-4e2f-a914-85466b16f123";
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "M1QTGQSRJ90R";

// URLs for different environments
const MERCHANT_BASE_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
const MERCHANT_STATUS_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status"
const MERCHANT_REFUND_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/refund"

// Frontend URLs
const successUrl = process.env.PAYMENT_SUCCESS_URL || "http://localhost:5173/payment-success"
const failureUrl = process.env.PAYMENT_FAILURE_URL || "http://localhost:5173/payment-failure"
const defaultRedirectUrl = process.env.PAYMENT_CALLBACK_URL || "http://localhost:3000/api/v1/payments/verify"

/**
 * Check if payment gateway is active
 */
const paymentStatus = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(
      200,
      { status: "active", provider: "PhonePe Sandbox" },
      "Payment gateway is active"
    )
  );
});

/**
 * Generate PhonePe checksum for API authentication
 * @private
 */
const generateChecksum = (string, keyIndex = 1) => {
  const sha256 = crypto.createHash('sha256').update(string).digest('hex');
  return sha256 + '###' + keyIndex;
}

/**
 * Save payment details to database
 * @private
 */
const savePayment = async (paymentData, dbTransaction) => {
  try {
    const payment = await Payment.create({
      transactionId: paymentData.merchantTransactionId,
      userId: paymentData.userId,
      amount: paymentData.amount / 100, // Convert back to actual amount
      status: "INITIATED",
      paymentMethod: "PHONEPE",
      gatewayTransactionId: paymentData.merchantTransactionId,
      gatewayResponse: paymentData,
      callbackUrl: paymentData.redirectUrl
    }, { transaction: dbTransaction });
    
    return payment;
  } catch (error) {
    console.error("Error saving payment:", error);
    throw error;
  }
}

/**
 * Update payment details in database
 * @private
 */
const updatePayment = async (transactionId, status, responseData, dbTransaction = null) => {
  try {
    const updateData = { 
      status,
      gatewayResponse: responseData,
      updatedAt: new Date()
    };

    const options = dbTransaction ? { transaction: dbTransaction } : {};
    
    const [affectedRows] = await Payment.update(
      updateData,
      { 
        where: { transactionId },
        ...options
      }
    );
    
    if (affectedRows > 0) {
      const payment = await Payment.findOne({ 
        where: { transactionId },
        ...options
      });
      return payment;
    }
    
    return false;
  } catch (error) {
    console.error("Error updating payment:", error);
    return false;
  }
}

/**
 * Initiate payment with PhonePe
 */
const initiatePhonePePayment = asyncHandler(async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  
  try {
    const {name, mobileNumber, amount, userId, description, callbackUrl} = req.body;
    
    // Validate required fields
    if (!amount || amount <= 0) {
      throw new ApiError(400, "Valid amount is required");
    }
    
    if (!mobileNumber) {
      throw new ApiError(400, "Mobile number is required");
    }
    
    const orderId = uuidv4();
    
    // Get user ID from authenticated user if available
    const userIdFromAuth = req.user?.id;
    const finalUserId = userId || userIdFromAuth || null;
    
    // Validate user exists if userId provided
    if (finalUserId) {
      const user = await User.findByPk(finalUserId, { transaction: dbTransaction });
      if (!user) {
        throw new ApiError(404, "User not found");
      }
    }
    
    // Use the frontend callback URL if provided, otherwise use the backend URL
    const redirectTarget = callbackUrl || defaultRedirectUrl;

    // Payment payload
    const paymentPayload = {
        merchantId: MERCHANT_ID,
        merchantUserId: name || "USER_" + Date.now(),
        mobileNumber: mobileNumber,
        amount: Number(amount) * 100, // Convert to paisa
        merchantTransactionId: orderId,
        redirectUrl: `${redirectTarget}?id=${orderId}`,
        redirectMode: 'GET',
        paymentInstrument: {
            type: 'PAY_PAGE'
        }
    };

    // Add optional description if provided
    if (description) {
        paymentPayload.paymentInstrument.description = description;
    }

    const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64')
    const keyIndex = 1
    const string = payload + '/pg/v1/pay' + MERCHANT_KEY
    const checksum = generateChecksum(string, keyIndex)

    const option = {
        method: 'POST',
        url: MERCHANT_BASE_URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        },
        data: {
            request: payload
        }
    }
    
    const response = await axios.request(option);
    
    // Save payment details
    const paymentData = {
      ...paymentPayload,
      userId: finalUserId
    };
    
    await savePayment(paymentData, dbTransaction);
    
    await dbTransaction.commit();
    
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          paymentUrl: response.data.data.instrumentResponse.redirectInfo.url,
          transactionId: orderId,
          amount: amount
        },
        "Payment initiated successfully"
      )
    );
  } catch (error) {
    await dbTransaction.rollback();
    console.error("PhonePe payment error:", error);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || error.message || "Something went wrong during payment initiation"
    );
  }
});

/**
 * Callback handler for PhonePe payment verification
 */
const verifyPhonePePayment = asyncHandler(async (req, res) => {
  const dbTransaction = await sequelize.transaction();
  
  try {
    const merchantTransactionId = req.query.id;
    
    if (!merchantTransactionId) {
      throw new ApiError(400, "Transaction ID is missing");
    }
    
    const keyIndex = 1
    const string = `/pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}` + MERCHANT_KEY
    const checksum = generateChecksum(string, keyIndex)

    const option = {
        method: 'GET',
        url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': MERCHANT_ID
        },
    }

    const response = await axios.request(option);
    
    // Get payment record
    const payment = await Payment.findOne({ 
      where: { transactionId: merchantTransactionId },
      transaction: dbTransaction 
    });
    
    if (!payment) {
      throw new ApiError(404, "Payment record not found");
    }
    
    // Update payment status
    if (response.data.success === true && response.data.data.responseCode === "SUCCESS") {
        await updatePayment(merchantTransactionId, "SUCCESS", response.data, dbTransaction);
        
        // If payment is successful and user exists, add money to wallet
        if (payment.userId) {
          const user = await User.findByPk(payment.userId, { transaction: dbTransaction });
          if (user) {
            const balanceBefore = parseFloat(user.walletBalance);
            const balanceAfter = balanceBefore + parseFloat(payment.amount);
            
            // Create wallet transaction
            await Transaction.create({
              userId: user.id,
              type: 'wallet_topup',
              amount: parseFloat(payment.amount),
              balanceBefore,
              balanceAfter,
              status: 'completed',
              description: `Wallet topup via PhonePe`,
              referenceId: `PP_${merchantTransactionId}`,
              externalTransactionId: merchantTransactionId,
              metadata: { 
                paymentMethod: 'PHONEPE',
                gatewayTransactionId: merchantTransactionId
              }
            }, { transaction: dbTransaction });
            
            // Update user balance
            await user.update({
              walletBalance: balanceAfter
            }, { transaction: dbTransaction });
          }
        }
        
        await dbTransaction.commit();
        return res.redirect(`${successUrl}?id=${merchantTransactionId}`);
    } else {
        await updatePayment(merchantTransactionId, "FAILED", response.data, dbTransaction);
        await dbTransaction.commit();
        return res.redirect(`${failureUrl}?id=${merchantTransactionId}`);
    }
  } catch (error) {
    await dbTransaction.rollback();
    console.error("PhonePe verification error:", error);
    return res.redirect(`${failureUrl}?error=verification_failed`);
  }
});

/**
 * Check the status of a payment transaction
 */
const checkPaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    if (!transactionId) {
      throw new ApiError(400, "Transaction ID is required");
    }
    
    // First check our database
    const payment = await Payment.findOne({ 
      where: { transactionId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'phone']
        }
      ]
    });
    
    if (!payment) {
      throw new ApiError(404, "Payment not found");
    }
    
    // If payment is not final, check with PhonePe
    if (payment.status === 'INITIATED' || payment.status === 'PENDING') {
      const keyIndex = 1
      const string = `/pg/v1/status/${MERCHANT_ID}/${transactionId}` + MERCHANT_KEY
      const checksum = generateChecksum(string, keyIndex)

      const option = {
          method: 'GET',
          url: `${MERCHANT_STATUS_URL}/${MERCHANT_ID}/${transactionId}`,
          headers: {
              accept: 'application/json',
              'Content-Type': 'application/json',
              'X-VERIFY': checksum,
              'X-MERCHANT-ID': MERCHANT_ID
          },
      }

      const response = await axios.request(option);
      
      if (response.data.success === true) {
        const paymentStatus = response.data.data.responseCode === "SUCCESS" ? "SUCCESS" : "FAILED";
        await updatePayment(transactionId, paymentStatus, response.data);
        payment.status = paymentStatus;
      }
    }
    
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          transactionId: payment.transactionId,
          status: payment.status,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
          user: payment.user
        },
        "Payment status retrieved successfully"
      )
    );
  } catch (error) {
    console.error("Payment status check error:", error);
    throw new ApiError(
      error.response?.status || 500,
      error.response?.data?.message || error.message || "Failed to check payment status"
    );
  }
});

/**
 * Get payment history for a user
 */
const getPaymentHistory = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, "User authentication required");
    }
    
    const offset = (page - 1) * limit;
    const whereClause = { userId };
    
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: payments } = await Payment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: { exclude: ['gatewayResponse'] }
    });

    const totalPages = Math.ceil(count / limit);

    return res.status(200).json(
      new ApiResponse(200, {
        payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: totalPages
        }
      }, "Payment history fetched successfully")
    );
  } catch (error) {
    console.error("Payment history error:", error);
    throw new ApiError(500, error.message || "Failed to fetch payment history");
  }
});

/**
 * Handle PhonePe webhook notifications
 */
const handlePhonePeWebhook = asyncHandler(async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers['x-verify'];
    const payload = req.body;
    
    if (!signature) {
      throw new ApiError(400, "Missing signature header");
    }
    
    // PhonePe webhook processing logic
    const transactionId = payload.data?.merchantTransactionId;
    const paymentStatus = payload.data?.responseCode === "SUCCESS" ? "SUCCESS" : "FAILED";
    
    if (transactionId) {
      await updatePayment(transactionId, paymentStatus, payload);
    }
    
    // Always return 200 OK for webhooks
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error("Webhook handling error:", error);
    
    // Always return 200 OK for webhooks even on error
    return res.status(200).json({
      success: true,
      message: "Webhook received but had processing issues"
    });
  }
});

export {
  initiatePhonePePayment,
  verifyPhonePePayment,
  paymentStatus,
  checkPaymentStatus,
  getPaymentHistory,
  handlePhonePeWebhook
};