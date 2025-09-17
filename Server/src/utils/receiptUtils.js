import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Generate enhanced professional transaction receipt PDF
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
      paymentMethod,
      ledgerDate,
      userCode,
      ledgerType,
      remarks
    } = receiptData;

    // Create receipts directory if it doesn't exist
    const receiptsDir = path.join(process.cwd(), 'public', 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const fileName = `receipt-${transactionId}-${Date.now()}.pdf`;
    const filePath = path.join(receiptsDir, fileName);

    // Create PDF document with enhanced options for better compatibility
    const doc = new PDFDocument({ 
      margin: 40,
      size: 'A4',
      bufferPages: true, // Enable buffering for better performance
      info: {
        Title: 'NEXASPAY Transaction Receipt',
        Author: 'NEXASPAY Digital Wallet',
        Subject: 'Transaction Receipt',
        Creator: 'NEXASPAY System',
        Producer: 'NEXASPAY Receipt Generator v2.0'
      }
    });
    
    // Create write stream with error handling
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Enhanced currency formatting function - FIX: Use Rs. instead of ₹ for PDF compatibility
    const formatCurrency = (amount) => {
      if (isNaN(amount) || amount === null || amount === undefined) return '0.00';
      return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Helper function to clean currency symbols for PDF compatibility
    const cleanCurrencyText = (text) => {
      if (!text) return text;
      // Replace rupee symbol with Rs. for better PDF compatibility
      return text.replace(/₹/g, 'Rs.').replace(/Rs\./g, 'Rs.');
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    };

    // Professional Header with Company Branding
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;
    
    // Add header background with gradient effect
    doc.rect(0, 0, pageWidth, 120)
       .fillAndStroke('#6B46C1', '#6B46C1');

    // Company Logo and Name
    doc.fontSize(28)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text('NEXASPAY', 50, 30);

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#E0E7FF')
       .text('Digital Wallet & Payment Solutions', 50, 65);

    // Receipt title
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text('TRANSACTION RECEIPT', pageWidth - 300, 35, { width: 250, align: 'right' });

    // Receipt status badge with better positioning
    const statusColor = status === 'completed' || status === 'success' ? '#10B981' : 
                       status === 'pending' ? '#F59E0B' : '#EF4444';
    const statusText = status === 'completed' || status === 'success' ? 'SUCCESS' : 
                      status === 'pending' ? 'PENDING' : 'FAILED';
    
    doc.rect(pageWidth - 150, 70, 100, 25)
       .fillAndStroke(statusColor, statusColor);
    
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#FFFFFF')
       .text(statusText, pageWidth - 150, 78, { width: 100, align: 'center' });

    // Receipt Number and Date
    doc.fontSize(10)
       .fillColor('#E0E7FF')
       .text(`Receipt #: ${referenceId || transactionId}`, pageWidth - 300, 100, { width: 250, align: 'right' });

    // Reset to black for main content
    doc.fillColor('#000000');

    // Transaction Summary Box with better styling
    let yPosition = 150;
    
    // Amount highlight box with border
    doc.rect(50, yPosition, pageWidth - 100, 80)
       .fillAndStroke('#F8FAFC', '#E2E8F0');

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1F2937')
       .text('Transaction Amount', 70, yPosition + 15);

    // FIX: Use Rs. instead of ₹ for better PDF compatibility
    doc.fontSize(32)
       .font('Helvetica-Bold')
       .fillColor(parseFloat(amount) >= 0 ? '#10B981' : '#EF4444')
       .text(`Rs.${formatCurrency(Math.abs(amount))}`, 70, yPosition + 35);

    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#6B7280')
       .text(`${parseFloat(amount) >= 0 ? 'Credit' : 'Debit'} Transaction`, 70, yPosition + 70);

    // Transaction details section
    yPosition += 120;
    
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1F2937')
       .text('Transaction Details', 50, yPosition);

    yPosition += 25;

    // Create two-column layout for details
    const leftColumn = 50;
    const rightColumn = pageWidth / 2;
    const lineHeight = 20;

    // Left column details
    const leftDetails = [
      ['Transaction ID:', transactionId],
      ['Reference ID:', referenceId || 'N/A'],
      ['Transaction Type:', (type || 'Transaction').replace('_', ' ').toUpperCase()],
      ['Payment Method:', paymentMethod || 'WALLET'],
      ['User Code:', userCode || user.phone || 'N/A']
    ];

    // Right column details - Clean currency symbols in description
    const rightDetails = [
      ['Date & Time:', formatDate(createdAt)],
      ['Ledger Date:', ledgerDate ? new Date(ledgerDate).toLocaleDateString('en-IN') : 'N/A'],
      ['Ledger Type:', ledgerType || 'Transaction'],
      ['Status:', statusText],
      ['Description:', cleanCurrencyText(description) || 'N/A']
    ];

    doc.fontSize(10).font('Helvetica');

    // Draw left column
    leftDetails.forEach((detail, index) => {
      const y = yPosition + (index * lineHeight);
      doc.fillColor('#6B7280')
         .text(detail[0], leftColumn, y, { width: 150 });
      doc.fillColor('#1F2937')
         .font('Helvetica-Bold')
         .text(detail[1], leftColumn + 100, y, { width: 150 });
      doc.font('Helvetica');
    });

    // Draw right column
    rightDetails.forEach((detail, index) => {
      const y = yPosition + (index * lineHeight);
      doc.fillColor('#6B7280')
         .text(detail[0], rightColumn, y, { width: 150 });
      doc.fillColor('#1F2937')
         .font('Helvetica-Bold')
         .text(detail[1], rightColumn + 100, y, { width: 150 });
      doc.font('Helvetica');
    });

    // Account Information Section
    yPosition += (Math.max(leftDetails.length, rightDetails.length) * lineHeight) + 30;

    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fillColor('#1F2937')
       .text('Account Information', 50, yPosition);

    yPosition += 25;

    // FIX: Use Rs. instead of ₹ for all currency displays
    const accountDetails = [
      ['Account Holder:', user.fullName],
      ['Phone Number:', user.phone],
      ['Opening Balance:', `Rs.${formatCurrency(balanceBefore || 0)}`],
      ['Transaction Amount:', `${parseFloat(amount) >= 0 ? '+' : '-'}Rs.${formatCurrency(Math.abs(amount))}`],
      ['Closing Balance:', `Rs.${formatCurrency(balanceAfter || 0)}`]
    ];

    doc.fontSize(10).font('Helvetica');

    accountDetails.forEach((detail, index) => {
      const y = yPosition + (index * lineHeight);
      doc.fillColor('#6B7280')
         .text(detail[0], 50, y, { width: 150 });
      doc.fillColor('#1F2937')
         .font('Helvetica-Bold')
         .text(detail[1], 200, y, { width: 300 });
      doc.font('Helvetica');
    });

    // Add separator line
    yPosition += (accountDetails.length * lineHeight) + 20;
    doc.strokeColor('#E5E7EB')
       .lineWidth(1)
       .moveTo(50, yPosition)
       .lineTo(pageWidth - 50, yPosition)
       .stroke();

    // Remarks section if available - Clean currency symbols
    if (remarks) {
      yPosition += 20;
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fillColor('#1F2937')
         .text('Remarks:', 50, yPosition);

      yPosition += 20;
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#374151')
         .text(cleanCurrencyText(remarks), 50, yPosition, { width: pageWidth - 100, align: 'left' });

      yPosition += 40;
    } else {
      yPosition += 30;
    }

    // Footer section with better positioning
    const footerY = Math.max(yPosition + 20, pageHeight - 150);

    // Security and disclaimer section
    doc.rect(50, footerY, pageWidth - 100, 80)
       .fillAndStroke('#F9FAFB', '#E5E7EB');

    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#1F2937')
       .text('🔒 Security Notice', 60, footerY + 10);

    doc.fontSize(9)
       .font('Helvetica')
       .fillColor('#4B5563')
       .text('This is a computer-generated receipt and does not require a physical signature.', 60, footerY + 25)
       .text('This transaction was processed securely using advanced encryption technology.', 60, footerY + 40)
       .text('For any queries or support, please contact us at support@nexaspay.com', 60, footerY + 55);

    // Company footer
    doc.fontSize(8)
       .font('Helvetica')
       .fillColor('#9CA3AF')
       .text('NEXASPAY Digital Wallet Solutions | Secure • Fast • Reliable', 50, pageHeight - 40, { 
         width: pageWidth - 100, 
         align: 'center' 
       });

    doc.fontSize(8)
       .text(`Generated on ${formatDate(new Date())} | Receipt ID: ${referenceId || transactionId}`, 50, pageHeight - 25, { 
         width: pageWidth - 100, 
         align: 'center' 
       });

    // Finalize PDF with proper error handling
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        // Verify file was created and has content
        if (fs.existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 0) {
            console.log(`✅ PDF generated successfully: ${fileName} (${stats.size} bytes)`);
            resolve(fileName);
          } else {
            console.error('❌ Generated PDF is empty');
            reject(new Error('Generated PDF file is empty'));
          }
        } else {
          console.error('❌ PDF file was not created');
          reject(new Error('PDF file was not created'));
        }
      });
      
      stream.on('error', (err) => {
        console.error('❌ PDF generation failed:', err);
        reject(err);
      });
      
      doc.on('error', (err) => {
        console.error('❌ PDF document error:', err);
        reject(err);
      });
    });

  } catch (error) {
    console.error('Error generating enhanced receipt:', error);
    throw new Error('Failed to generate transaction receipt: ' + error.message);
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

This is a system-generated receipt.
For support: support@nexaspay.com

NEXASPAY - Secure Digital Payments
================================
  `;
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