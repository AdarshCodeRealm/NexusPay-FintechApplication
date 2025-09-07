import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate transaction receipt PDF
 * @param {Object} receiptData - Transaction and user data
 * @returns {Promise<string>} - Path to generated PDF
 */
export const generateTransactionReceipt = async (receiptData) => {
  try {
    const {
      transactionId,
      amount,
      type,
      status,
      createdAt,
      user,
      balanceBefore,
      balanceAfter,
      description,
      referenceId,
      paymentMethod
    } = receiptData;

    // Create receipts directory if it doesn't exist
    const receiptsDir = path.join(process.cwd(), 'public', 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const fileName = `receipt-${transactionId}-${Date.now()}.pdf`;
    const filePath = path.join(receiptsDir, fileName);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#6B46C1')
       .text('NEXASPAY', 50, 50);

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#000000')
       .text('Digital Wallet Transaction Receipt', 50, 80);

    // Transaction details section
    let yPosition = 120;
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Transaction Details', 50, yPosition);

    yPosition += 30;

    // Transaction info
    const details = [
      ['Transaction ID:', transactionId],
      ['Reference ID:', referenceId],
      ['Date & Time:', new Date(createdAt).toLocaleString('en-IN', { 
        timeZone: 'Asia/Kolkata',
        dateStyle: 'full',
        timeStyle: 'medium'
      })],
      ['Type:', type.replace('_', ' ').toUpperCase()],
      ['Description:', description],
      ['Payment Method:', paymentMethod || 'PHONEPE'],
      ['Status:', status.toUpperCase()],
      ['Amount:', `₹${parseFloat(amount).toFixed(2)}`]
    ];

    doc.fontSize(10).font('Helvetica');

    details.forEach(([label, value]) => {
      doc.fillColor('#666666')
         .text(label, 50, yPosition, { width: 150, align: 'left' })
         .fillColor('#000000')
         .text(value, 200, yPosition, { width: 300 });
      yPosition += 20;
    });

    // Balance information
    yPosition += 20;
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#000000')
       .text('Balance Information', 50, yPosition);

    yPosition += 30;

    const balanceDetails = [
      ['Previous Balance:', `₹${parseFloat(balanceBefore).toFixed(2)}`],
      ['Transaction Amount:', `${amount >= 0 ? '+' : ''}₹${parseFloat(amount).toFixed(2)}`],
      ['Current Balance:', `₹${parseFloat(balanceAfter).toFixed(2)}`]
    ];

    doc.fontSize(10).font('Helvetica');

    balanceDetails.forEach(([label, value]) => {
      doc.fillColor('#666666')
         .text(label, 50, yPosition, { width: 150, align: 'left' })
         .fillColor('#000000')
         .text(value, 200, yPosition, { width: 300 });
      yPosition += 20;
    });

    // User information
    yPosition += 20;
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('Account Information', 50, yPosition);

    yPosition += 30;

    const userDetails = [
      ['Account Holder:', user.fullName],
      ['Phone Number:', user.phone],
      ['User ID:', user.id]
    ];

    doc.fontSize(10).font('Helvetica');

    userDetails.forEach(([label, value]) => {
      doc.fillColor('#666666')
         .text(label, 50, yPosition, { width: 150, align: 'left' })
         .fillColor('#000000')
         .text(value, 200, yPosition, { width: 300 });
      yPosition += 20;
    });

    // Footer
    yPosition += 40;
    doc.fontSize(8)
       .fillColor('#999999')
       .text('This is a system-generated receipt. No signature required.', 50, yPosition);

    doc.text('For any queries, contact support at support@nexaspay.com', 50, yPosition + 15);

    // Security note
    yPosition += 40;
    doc.fontSize(10)
       .fillColor('#6B46C1')
       .text('🔒 Secure Transaction', 50, yPosition);

    doc.fontSize(8)
       .fillColor('#666666')
       .text('This transaction was processed securely using advanced encryption.', 50, yPosition + 15);

    // Finalize PDF
    doc.end();

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        resolve(fileName);
      });
      doc.on('error', reject);
    });

  } catch (error) {
    console.error('Error generating receipt:', error);
    throw new Error('Failed to generate transaction receipt');
  }
};

/**
 * Generate simple text receipt for email/SMS
 * @param {Object} receiptData - Transaction data
 * @returns {string} - Formatted text receipt
 */
export const generateTextReceipt = (receiptData) => {
  const {
    transactionId,
    amount,
    type,
    status,
    createdAt,
    user,
    balanceAfter,
    description,
    referenceId
  } = receiptData;

  return `
NEXASPAY - Transaction Receipt
================================

Transaction ID: ${transactionId}
Reference ID: ${referenceId}
Date: ${new Date(createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

Transaction Details:
- Type: ${type.replace('_', ' ').toUpperCase()}
- Description: ${description}
- Amount: ₹${parseFloat(amount).toFixed(2)}
- Status: ${status.toUpperCase()}

Account: ${user.fullName} (${user.phone})
Current Balance: ₹${parseFloat(balanceAfter).toFixed(2)}

Thank you for using NEXASPAY!
For support: support@nexaspay.com
================================
  `.trim();
};

/**
 * Clean up old receipt files (older than 30 days)
 */
export const cleanupOldReceipts = () => {
  try {
    const receiptsDir = path.join(process.cwd(), 'public', 'receipts');
    if (!fs.existsSync(receiptsDir)) return;

    const files = fs.readdirSync(receiptsDir);
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

    files.forEach(file => {
      const filePath = path.join(receiptsDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old receipt: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up receipts:', error);
  }
};