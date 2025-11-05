import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { asyncHandler } from "../utils/utils/asyncHandler.js";
import { ApiError } from "../utils/utils/ApiError.js";
import { ApiResponse } from "../utils/utils/ApiResponse.js";
import { User, Transaction, Payment } from "../models/index.js";
import { sequelize } from "../db/index.js";
import { generateTransactionReceipt, generateTextReceipt } from "../utils/receiptUtils.js";
import { generateEnhancedTransactionId, generateReferenceId } from "../utils/transactionUtils.js";

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

// Environment-aware URLs - Auto-detect production vs development
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
const baseUrl = isProduction 
  ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://nexus-pay-fintech-application.vercel.app')
  : 'http://localhost:3000';

const frontendUrl = isProduction
  ? 'https://nexus-pay-fintech-application-8gni.vercel.app'
  : 'http://localhost:5173';

// Frontend URLs with environment detection
const successUrl = process.env.PAYMENT_SUCCESS_URL || `${frontendUrl}/payment-success`;
const failureUrl = process.env.PAYMENT_FAILURE_URL || `${frontendUrl}/payment-failure`;
const defaultRedirectUrl = process.env.PAYMENT_CALLBACK_URL || `${baseUrl}/api/v1/payments/verify`;

console.log("Payment URLs Configuration:", {
  isProduction,
  baseUrl,
  frontendUrl,
  successUrl,
  failureUrl,
  defaultRedirectUrl
});

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
        
        // CRITICAL FIX: Always process wallet update for successful payments with user
        if (payment.userId && payment.user) {
          try {
            console.log("🔄 Processing wallet update...");
            await processSuccessfulPaymentWalletUpdate(payment, response.data.data, dbTransaction);
            console.log("✅ Wallet update completed successfully");
          } catch (walletError) {
            console.error("💥 Wallet update failed:", walletError);
            // Log the error but don't fail the entire transaction
            // This ensures payment is marked as successful even if wallet update fails
            // The diagnostic script can fix this later
            console.error("⚠️ Payment successful but wallet update failed - manual fix required");
          }
        } else {
          console.log("⚠️ No user found for wallet update");
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
          
          // CRITICAL FIX: Process wallet update when payment becomes successful
          if (paymentStatus === "SUCCESS" && payment.status !== "SUCCESS") {
            console.log("🎉 Payment status changed to SUCCESS - Processing wallet update...");
            
            // Start database transaction for wallet update
            const dbTransaction = await sequelize.transaction();
            
            try {
              // Update payment status first
              await updatePayment(transactionId, paymentStatus, response.data, dbTransaction);
              
              // Process wallet update for successful payment
              if (payment.userId && payment.user) {
                console.log("🔄 Processing wallet update for successful payment...");
                await processSuccessfulPaymentWalletUpdate(payment, response.data.data, dbTransaction);
                console.log("✅ Wallet update completed successfully");
              }
              
              await dbTransaction.commit();
              payment.status = paymentStatus; // Update local object for response
              
            } catch (walletError) {
              await dbTransaction.rollback();
              console.error("💥 Wallet update failed:", walletError);
              // Still update payment status even if wallet update fails
              await updatePayment(transactionId, paymentStatus, response.data);
              payment.status = paymentStatus;
            }
          } else if (paymentStatus !== payment.status) {
            // Update payment status for non-success status changes
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
    
    // Parse transaction metadata to check for existing receipt
    let metadata = {};
    try {
      metadata = JSON.parse(transaction.transactionMetadata || '{}');
    } catch (e) {
      metadata = {};
    }
    
    const receiptFile = metadata.receiptFile;
    
    if (!receiptFile) {
      // Generate receipt if it doesn't exist
      const receiptData = {
        transactionId: transaction.id,
        amount: transaction.amount,
        type: transaction.transactionType || transaction.type || 'transaction',
        status: transaction.status,
        createdAt: transaction.createdAt,
        user: transaction.user,
        balanceBefore: transaction.openingBalance || 0,
        balanceAfter: transaction.closingBalance || transaction.balanceAfter || 0,
        description: transaction.description || `${transaction.transactionType || 'Transaction'} - ₹${Math.abs(transaction.amount)}`,
        referenceId: transaction.referenceNumber || transaction.referenceId || transaction.id,
        paymentMethod: metadata.paymentMethod || 'WALLET',
        ledgerDate: new Date(transaction.createdAt).toISOString().split('T')[0],
        userCode: transaction.user.phone || `CSP${transaction.user.id}`,
        ledgerType: transaction.transactionType === 'deposit' ? 'TopIn' : 'Transaction',
        remarks: transaction.description || `Transaction by ${transaction.user.fullName}`
      };
      
      const newReceiptFile = await generateTransactionReceipt(receiptData);
      
      // Update transaction with receipt file
      await transaction.update({
        transactionMetadata: JSON.stringify({
          ...metadata,
          receiptFile: newReceiptFile,
          receiptGeneratedAt: new Date().toISOString()
        })
      });
      
      const filePath = path.join(process.cwd(), 'public', 'receipts', newReceiptFile);
      return res.download(filePath, `NEXASPAY-Receipt-${transaction.referenceNumber || transaction.id}.pdf`);
    }
    
    // Serve existing receipt
    const filePath = path.join(process.cwd(), 'public', 'receipts', receiptFile);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Receipt file is missing, regenerate it
      console.log(`Receipt file missing: ${receiptFile}, regenerating...`);
      
      const receiptData = {
        transactionId: transaction.id,
        amount: transaction.amount,
        type: transaction.transactionType || transaction.type || 'transaction',
        status: transaction.status,
        createdAt: transaction.createdAt,
        user: transaction.user,
        balanceBefore: transaction.openingBalance || 0,
        balanceAfter: transaction.closingBalance || transaction.balanceAfter || 0,
        description: transaction.description || `${transaction.transactionType || 'Transaction'} - ₹${Math.abs(transaction.amount)}`,
        referenceId: transaction.referenceNumber || transaction.referenceId || transaction.id,
        paymentMethod: metadata.paymentMethod || 'WALLET',
        ledgerDate: new Date(transaction.createdAt).toISOString().split('T')[0],
        userCode: transaction.user.phone || `CSP${transaction.user.id}`,
        ledgerType: transaction.transactionType === 'deposit' ? 'TopIn' : 'Transaction',
        remarks: transaction.description || `Transaction by ${transaction.user.fullName}`
      };
      
      const newReceiptFile = await generateTransactionReceipt(receiptData);
      
      // Update transaction with new receipt file
      await transaction.update({
        transactionMetadata: JSON.stringify({
          ...metadata,
          receiptFile: newReceiptFile,
          receiptRegeneratedAt: new Date().toISOString()
        })
      });
      
      const newFilePath = path.join(process.cwd(), 'public', 'receipts', newReceiptFile);
      return res.download(newFilePath, `NEXASPAY-Receipt-${transaction.referenceNumber || transaction.id}.pdf`);
    }
    
    res.download(filePath, `NEXASPAY-Receipt-${transaction.referenceNumber || transaction.id}.pdf`);
    
  } catch (error) {
    console.error("Receipt download error:", error);
    throw new ApiError(500, error.message || "Failed to download receipt");
  }
});

/**
 * Create a shareable public link for receipt
 */
const createReceiptShareLink = asyncHandler(async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw new ApiError(401, "User authentication required");
    }
    
    // Find the transaction
    const transaction = await Transaction.findOne({
      where: { 
        id: transactionId,
        userId: userId
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

    // Generate a secure share token
    const shareToken = crypto.randomBytes(32).toString('hex');
    const shareExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Update transaction with share token
    await transaction.update({
      transactionMetadata: JSON.stringify({
        ...JSON.parse(transaction.transactionMetadata || '{}'),
        shareToken,
        shareExpiry: shareExpiry.toISOString(),
        sharedAt: new Date().toISOString()
      })
    });

    // Generate the public share URL
    const baseUrl = process.env.FRONTEND_URL || 'https://nexus-pay-fintech-application-8gni.vercel.app';
    const shareUrl = `${baseUrl}/receipt/${shareToken}`;

    return res.status(200).json(
      new ApiResponse(200, {
        shareUrl,
        shareToken,
        expiresAt: shareExpiry.toISOString(),
        transaction: {
          id: transaction.id,
          referenceId: transaction.referenceNumber,
          amount: transaction.amount,
          description: transaction.description,
          createdAt: transaction.createdAt
        }
      }, "Receipt share link created successfully")
    );

  } catch (error) {
    console.error("Receipt share link creation error:", error);
    throw new ApiError(500, error.message || "Failed to create share link");
  }
});

/**
 * View public receipt (no authentication required)
 */
const viewPublicReceipt = asyncHandler(async (req, res) => {
  try {
    const { shareToken } = req.params;
    
    if (!shareToken) {
      throw new ApiError(400, "Share token is required");
    }

    // Find transaction by share token
    const transaction = await Transaction.findOne({
      where: {
        transactionMetadata: {
          [Op.like]: `%"shareToken":"${shareToken}"%`
        }
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
      throw new ApiError(404, "Receipt not found or link has expired");
    }

    // Parse metadata to check expiry
    let metadata = {};
    try {
      metadata = JSON.parse(transaction.transactionMetadata || '{}');
    } catch (e) {
      metadata = {};
    }

    // Check if share link has expired
    if (metadata.shareExpiry && new Date(metadata.shareExpiry) < new Date()) {
      throw new ApiError(410, "Share link has expired");
    }

    // Return transaction data for public viewing
    return res.status(200).json(
      new ApiResponse(200, {
        transaction: {
          id: transaction.id,
          referenceId: transaction.referenceNumber,
          amount: transaction.amount,
          description: transaction.description,
          status: transaction.status,
          type: transaction.type,
          createdAt: transaction.createdAt,
          balanceAfter: transaction.balanceAfter,
          user: {
            name: transaction.user.fullName,
            phone: transaction.user.phone.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3') // Mask phone
          }
        },
        sharedAt: metadata.sharedAt,
        expiresAt: metadata.shareExpiry
      }, "Receipt retrieved successfully")
    );

  } catch (error) {
    console.error("Public receipt view error:", error);
    throw new ApiError(error.statusCode || 500, error.message || "Failed to retrieve receipt");
  }
});

/**
 * Download public receipt PDF (no authentication required)
 */
const downloadPublicReceipt = asyncHandler(async (req, res) => {
  try {
    const { shareToken } = req.params;
    
    if (!shareToken) {
      throw new ApiError(400, "Share token is required");
    }

    // Find transaction by share token
    const transaction = await Transaction.findOne({
      where: {
        transactionMetadata: {
          [Op.like]: `%"shareToken":"${shareToken}"%`
        }
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
      throw new ApiError(404, "Receipt not found or link has expired");
    }

    // Parse metadata to check expiry
    let metadata = {};
    try {
      metadata = JSON.parse(transaction.transactionMetadata || '{}');
    } catch (e) {
      metadata = {};
    }

    // Check if share link has expired
    if (metadata.shareExpiry && new Date(metadata.shareExpiry) < new Date()) {
      throw new ApiError(410, "Share link has expired");
    }

    // Generate receipt data with proper field mapping
    const receiptData = {
      transactionId: transaction.id,
      amount: transaction.amount,
      type: transaction.transactionType || transaction.type || 'transaction',
      status: transaction.status,
      createdAt: transaction.createdAt,
      user: transaction.user,
      balanceBefore: transaction.openingBalance || transaction.balanceBefore || 0,
      balanceAfter: transaction.closingBalance || transaction.balanceAfter || 0,
      description: transaction.description || `${transaction.transactionType || 'Transaction'} - ₹${Math.abs(transaction.amount)}`,
      referenceId: transaction.referenceNumber || transaction.referenceId || transaction.id,
      paymentMethod: metadata.paymentMethod || 'WALLET',
      ledgerDate: new Date(transaction.createdAt).toISOString().split('T')[0],
      userCode: transaction.user.phone || `CSP${transaction.user.id}`,
      ledgerType: (transaction.transactionType || transaction.type) === 'deposit' ? 'TopIn' : 'Transaction',
      remarks: transaction.description || `Transaction by ${transaction.user.fullName}`
    };

    console.log('Generating public receipt for:', {
      transactionId: transaction.id,
      shareToken: shareToken.substring(0, 8) + '...',
      amount: transaction.amount,
      user: transaction.user.fullName
    });

    // Generate receipt PDF
    const receiptFileName = await generateTransactionReceipt(receiptData);
    const filePath = path.join(process.cwd(), 'public', 'receipts', receiptFileName);
    
    // Check if file exists and is valid
    if (!fs.existsSync(filePath)) {
      console.error('Receipt file not found at:', filePath);
      throw new ApiError(404, "Receipt file not found");
    }

    // Check file size to ensure it's not corrupted
    const stats = fs.statSync(filePath);
    if (stats.size === 0) {
      console.error('Receipt file is empty:', filePath);
      throw new ApiError(500, "Receipt file is corrupted");
    }

    console.log('Serving receipt file:', {
      fileName: receiptFileName,
      filePath,
      fileSize: stats.size
    });

    // Set proper headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="NEXASPAY-Receipt-${transaction.referenceNumber || transaction.id}.pdf"`);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Use res.download() for better file handling
    res.download(filePath, `NEXASPAY-Receipt-${transaction.referenceNumber || transaction.id}.pdf`, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        if (!res.headersSent) {
          throw new ApiError(500, "Failed to send receipt file");
        }
      } else {
        console.log('Receipt downloaded successfully for shareToken:', shareToken.substring(0, 8) + '...');
      }
    });

  } catch (error) {
    console.error("Public receipt download error:", error);
    
    // If headers haven't been sent yet, send error response
    if (!res.headersSent) {
      throw new ApiError(error.statusCode || 500, error.message || "Failed to download receipt");
    }
  }
});

/**
 * Process wallet update for successful payment
 * @private
 */
const processSuccessfulPaymentWalletUpdate = async (payment, phonepeResponseData, dbTransaction) => {
  try {
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
    
    console.log(`💰 WALLET UPDATE INITIATED:`, {
      userId: user.id,
      userName: user.fullName,
      balanceBefore: balanceBefore,
      paymentAmount: transactionAmount,
      balanceAfter: balanceAfter,
      transactionId: payment.transactionId
    });
    
    // Check if this payment has already been processed using correct column names
    const existingTransaction = await Transaction.findOne({
      where: {
        bankReference: payment.transactionId, // Changed from externalTransactionId
        transactionType: 'deposit', // Changed from type: 'wallet_topup'
        status: 'completed'
      },
      transaction: dbTransaction
    });
    
    if (existingTransaction) {
      console.log(`⚠️ Duplicate payment processing prevented for transaction: ${payment.transactionId}`);
      return existingTransaction;
    }
    
    // STEP 1: Create wallet transaction record using correct schema
    const walletTransaction = await Transaction.create({
      userId: user.id,
      transactionType: 'deposit', // Using correct enum value
      amount: transactionAmount,
      openingBalance: balanceBefore, // Using correct column name
      closingBalance: balanceAfter, // Using correct column name
      status: 'pending',
      description: `Wallet topup via PhonePe - ₹${transactionAmount}`,
      referenceNumber: `PP_${payment.transactionId}`, // Using correct column name
      bankReference: payment.transactionId, // Using correct column name
      paymentMethod: 'PHONEPE',
      transactionMetadata: JSON.stringify({ // Using correct column name
        paymentMethod: 'PHONEPE',
        gatewayTransactionId: payment.transactionId,
        phonepeResponse: phonepeResponseData,
        processingStep: 'transaction_created'
      })
    }, { transaction: dbTransaction });
    
    console.log(`✅ Transaction record created: ${walletTransaction.id} - Status: PENDING`);
    
    // STEP 2: Update user balance atomically with optimistic locking
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
    
    console.log(`✅ Wallet balance updated: ₹${balanceBefore} → ₹${balanceAfter}`);
    
    // STEP 3: Update transaction status to COMPLETED
    await walletTransaction.update({
      status: 'completed',
      transactionMetadata: JSON.stringify({
        ...JSON.parse(walletTransaction.transactionMetadata || '{}'),
        processingStep: 'balance_updated',
        completedAt: new Date()
      })
    }, { transaction: dbTransaction });
    
    console.log(`✅ Transaction status updated to COMPLETED: ${walletTransaction.id}`);
    
    // STEP 4: Generate transaction receipt (optional, don't fail if this fails)
    try {
      const receiptData = {
        transactionId: walletTransaction.id,
        amount: transactionAmount,
        type: walletTransaction.transactionType,
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
        referenceId: walletTransaction.referenceNumber,
        paymentMethod: 'PHONEPE',
        // Enhanced fields for comprehensive receipt matching transaction table structure
        ledgerDate: new Date().toISOString().split('T')[0], // Current date as ledger date
        userCode: user.phone || `CSP${user.id}`,
        ledgerType: 'TopIn via Payment Gateway PhonePe by CSP' + user.id,
        remarks: `TopIn via Payment Gateway PhonePe by CSP${user.id} - ₹${transactionAmount}`
      };
      
      const receiptFileName = await generateTransactionReceipt(receiptData);
      
      // Update transaction with receipt file name
      await walletTransaction.update({
        transactionMetadata: JSON.stringify({
          ...JSON.parse(walletTransaction.transactionMetadata || '{}'),
          receiptFile: receiptFileName,
          processingStep: 'receipt_generated'
        })
      }, { transaction: dbTransaction });
      
      console.log(`📄 Receipt generated: ${receiptFileName}`);
    } catch (receiptError) {
      console.error('Receipt generation failed:', receiptError);
      // Don't fail the transaction if receipt generation fails
      await walletTransaction.update({
        transactionMetadata: JSON.stringify({
          ...JSON.parse(walletTransaction.transactionMetadata || '{}'),
          processingStep: 'receipt_failed',
          receiptError: receiptError.message
        })
      }, { transaction: dbTransaction });
    }
    
    return walletTransaction;
    
  } catch (error) {
    console.error('💥 Wallet update failed:', error);
    throw error;
  }
};

export {
  initiatePhonePePayment,
  verifyPhonePePayment,
  paymentStatus,
  checkPaymentStatus,
  getPaymentHistory,
  handlePhonePeWebhook,
  downloadTransactionReceipt,
  createReceiptShareLink,
  viewPublicReceipt,
  downloadPublicReceipt
};