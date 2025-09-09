import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import { User, Transaction, Payment } from "../models/index.js";
import { sequelize } from "../db/index.js";
import { generateTransactionReceipt, generateTextReceipt } from "../utils/receiptUtils.js";

// PhonePe Configuration with better error handling
// const MERCHANT_KEY = process.env.PHONEPE_SALT_KEY || "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
// const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || "PGTESTPAYUAT";
const MERCHANT_KEY = "96434309-7796-489d-8924-ab56988a6076";
const MERCHANT_ID = "PGTESTPAYUAT86";
// Validate PhonePe credentials on startup
if (!MERCHANT_KEY || !MERCHANT_ID) {
  console.error("PhonePe credentials are missing. Please check your environment variables.");
}

console.log("PhonePe Configuration:", {
  MERCHANT_ID: MERCHANT_ID,
  MERCHANT_KEY: MERCHANT_KEY ? `${MERCHANT_KEY.substring(0, 8)}...` : 'NOT SET',
  NODE_ENV: process.env.NODE_ENV
});

// URLs for different environments - Updated for correct test environment
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
      { 
        status: "active", 
        provider: "PhonePe Sandbox",
        merchantId: MERCHANT_ID,
        configured: !!(MERCHANT_KEY && MERCHANT_ID)
      },
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
    const {name, mobileNumber, amount, userId, description, callbackUrl, redirectMode = 'same-tab'} = req.body;
    
    // Validate PhonePe configuration
    if (!MERCHANT_KEY || !MERCHANT_ID) {
      throw new ApiError(500, "PhonePe configuration is incomplete");
    }
    
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

    console.log("Payment payload:", JSON.stringify(paymentPayload, null, 2));

    const payload = Buffer.from(JSON.stringify(paymentPayload)).toString('base64')
    const keyIndex = 1
    const string = payload + '/pg/v1/pay' + MERCHANT_KEY
    const checksum = generateChecksum(string, keyIndex)

    console.log("Generated checksum:", checksum);
    console.log("Request string:", string.substring(0, 100) + "...");

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
    
    console.log("Making request to:", MERCHANT_BASE_URL);
    console.log("Request headers:", option.headers);
    
    const response = await axios.request(option);
    
    console.log("PhonePe response:", response.data);
    console.log("response.data.data.instrumentResponse.redirectInfo.url",response.data.data.instrumentResponse.redirectInfo.url)
    
    // Save payment details
    const paymentData = {
      ...paymentPayload,
      userId: finalUserId
    };
    
    await savePayment(paymentData, dbTransaction);
    
    await dbTransaction.commit();
    
    // Always return JSON response with payment URL
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
    console.error("Error response:", error.response?.data);
    
    // More specific error handling
    if (error.response?.data?.message?.includes("Key not found")) {
      throw new ApiError(500, "PhonePe merchant configuration error. Please check credentials.");
    }
    
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
  console.log("Received callback from PhonePe");
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
      throw new ApiError(404, "Payment record not found");
    }
    
    // Update payment status
    if (response.data.success === true && response.data.data.responseCode === "SUCCESS") {
        // LOG PAYMENT SUCCESS ON SERVER
        console.log("🎉 PAYMENT SUCCESS! 🎉");
        console.log("Transaction ID:", merchantTransactionId);
        console.log("Amount:", payment.amount);
        console.log("User:", payment.user?.fullName);
        console.log("Phone:", payment.user?.phone);
        console.log("Payment Response:", response.data.data);
        
        await updatePayment(merchantTransactionId, "SUCCESS", response.data, dbTransaction);
        
        let receiptFileName = null;
        let walletTransaction = null;
        
        // If payment is successful and user exists, add money to wallet SECURELY
        if (payment.userId && payment.user) {
          const user = payment.user;
          
          // Get current balance with row-level locking to prevent race conditions
          const userWithLock = await User.findByPk(user.id, { 
            transaction: dbTransaction,
            lock: dbTransaction.LOCK.UPDATE
          });
          
          if (!userWithLock) {
            throw new ApiError(404, "User not found during balance update");
          }
          
          // Calculate secure balance update
          const balanceBefore = parseFloat(userWithLock.walletBalance) || 0;
          const transactionAmount = parseFloat(payment.amount);
          const balanceAfter = balanceBefore + transactionAmount;
          
          // Validate transaction amount
          if (transactionAmount <= 0) {
            throw new ApiError(400, "Invalid transaction amount");
          }
          
          // STEP 1: Create wallet transaction record FIRST with PENDING status
          walletTransaction = await Transaction.create({
            userId: user.id,
            type: 'wallet_topup',
            amount: transactionAmount,
            balanceBefore,
            balanceAfter,
            status: 'pending', // Initially pending
            description: `Wallet topup via PhonePe - ₹${transactionAmount}`,
            referenceId: `PP_${merchantTransactionId}`,
            externalTransactionId: merchantTransactionId,
            metadata: { 
              paymentMethod: 'PHONEPE',
              gatewayTransactionId: merchantTransactionId,
              phonepeResponse: response.data.data,
              processingStep: 'transaction_created'
            }
          }, { transaction: dbTransaction });
          
          console.log(`Transaction record created: ${walletTransaction.id} - Status: PENDING`);
          
          // STEP 2: Update user balance atomically
          const [updateCount] = await User.update(
            { walletBalance: balanceAfter },
            { 
              where: { 
                id: user.id,
                walletBalance: balanceBefore // Ensure balance hasn't changed
              },
              transaction: dbTransaction 
            }
          );
          
          if (updateCount === 0) {
            throw new ApiError(409, "Balance update conflict - transaction will be retried");
          }
          
          console.log(`✅ Wallet balance updated: ₹${balanceBefore} -> ₹${balanceAfter}`);
          
          // STEP 3: Update transaction status to COMPLETED only after successful balance update
          await walletTransaction.update({
            status: 'completed',
            metadata: {
              ...walletTransaction.metadata,
              processingStep: 'balance_updated',
              completedAt: new Date()
            }
          }, { transaction: dbTransaction });
          
          console.log(`✅ Transaction status updated to COMPLETED: ${walletTransaction.id}`);
          
          // STEP 4: Generate transaction receipt
          try {
            const receiptData = {
              transactionId: walletTransaction.id,
              amount: transactionAmount,
              type: walletTransaction.type,
              status: walletTransaction.status,
              createdAt: walletTransaction.createdAt,
              user: {
                id: user.id,
                fullName: user.fullName,
                phone: user.phone
              },
              balanceBefore,
              balanceAfter,
              description: walletTransaction.description,
              referenceId: walletTransaction.referenceId,
              paymentMethod: 'PHONEPE'
            };
            
            receiptFileName = await generateTransactionReceipt(receiptData);
            
            // Update transaction with receipt file name
            await walletTransaction.update({
              metadata: {
                ...walletTransaction.metadata,
                receiptFile: receiptFileName,
                processingStep: 'receipt_generated'
              }
            }, { transaction: dbTransaction });
            
            console.log(`📄 Receipt generated: ${receiptFileName}`);
          } catch (receiptError) {
            console.error('Receipt generation failed:', receiptError);
            // Don't fail the transaction if receipt generation fails
            await walletTransaction.update({
              metadata: {
                ...walletTransaction.metadata,
                processingStep: 'receipt_failed',
                receiptError: receiptError.message
              }
            }, { transaction: dbTransaction });
          }
        }
        
        await dbTransaction.commit();
        
        // REDIRECT TO SUCCESS URL TO CLOSE POPUP
        console.log("🔄 Redirecting to success page...");
        return res.redirect(`${successUrl}?id=${merchantTransactionId}&status=success&amount=${payment.amount}`);
        
    } else {
        console.log("❌ PAYMENT FAILED!");
        console.log("Transaction ID:", merchantTransactionId);
        console.log("Response:", response.data);
        
        await updatePayment(merchantTransactionId, "FAILED", response.data, dbTransaction);
        await dbTransaction.commit();
        
        // REDIRECT TO FAILURE URL
        return res.redirect(`${failureUrl}?id=${merchantTransactionId}&status=failed&reason=payment_failed`);
    }
  } catch (error) {
    await dbTransaction.rollback();
    console.error("💥 PhonePe verification error:", error);
    
    // REDIRECT TO FAILURE URL ON ERROR
    return res.redirect(`${failureUrl}?id=${error.query?.id || 'unknown'}&status=error&reason=verification_failed`);
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
    
    // If payment is still in progress, check with PhonePe
    if (payment.status === 'INITIATED' || payment.status === 'PENDING') {
      try {
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
          let paymentStatus = "PENDING";
          
          // Map PhonePe response codes to our status
          if (response.data.data.responseCode === "SUCCESS") {
            paymentStatus = "SUCCESS";
          } else if (response.data.data.responseCode === "FAILURE") {
            paymentStatus = "FAILED";
          } else if (response.data.data.responseCode === "PENDING") {
            paymentStatus = "PENDING";
          }
          
          // Only update if status has changed from INITIATED
          if (paymentStatus !== payment.status) {
            await updatePayment(transactionId, paymentStatus, response.data);
            payment.status = paymentStatus;
          }
        }
      } catch (phonepeError) {
        console.error("PhonePe status check error:", phonepeError);
        // Don't fail the entire request if PhonePe check fails
        // Return the current database status
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
          user: payment.user,
          // Add additional info for debugging
          isProcessing: payment.status === 'INITIATED' || payment.status === 'PENDING'
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

/**
 * Download transaction receipt
 */
const downloadTransactionReceipt = asyncHandler(async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, "User authentication required");
    }
    
    // Find the transaction with receipt info
    const transaction = await Transaction.findOne({
      where: { 
        id: transactionId,
        userId: userId // Ensure user can only access their own receipts
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'phone']
        }
      ]
    });
    
    if (!transaction) {
      throw new ApiError(404, "Transaction not found or access denied");
    }
    
    // Check if receipt exists in metadata
    const receiptFile = transaction.metadata?.receiptFile;
    
    if (!receiptFile) {
      // Generate receipt if it doesn't exist
      const receiptData = {
        transactionId: transaction.id,
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt,
        user: transaction.user,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
        description: transaction.description,
        referenceId: transaction.referenceId,
        paymentMethod: transaction.metadata?.paymentMethod || 'WALLET'
      };
      
      const newReceiptFile = await generateTransactionReceipt(receiptData);
      
      // Update transaction with receipt file
      await transaction.update({
        metadata: {
          ...transaction.metadata,
          receiptFile: newReceiptFile
        }
      });
      
      const filePath = path.join(process.cwd(), 'public', 'receipts', newReceiptFile);
      return res.download(filePath, newReceiptFile);
    }
    
    // Serve existing receipt
    const filePath = path.join(process.cwd(), 'public', 'receipts', receiptFile);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new ApiError(404, "Receipt file not found");
    }
    
    res.download(filePath, receiptFile);
    
  } catch (error) {
    console.error("Receipt download error:", error);
    throw new ApiError(500, error.message || "Failed to download receipt");
  }
});

export {
  initiatePhonePePayment,
  verifyPhonePePayment,
  paymentStatus,
  checkPaymentStatus,
  getPaymentHistory,
  handlePhonePeWebhook,
  downloadTransactionReceipt
};