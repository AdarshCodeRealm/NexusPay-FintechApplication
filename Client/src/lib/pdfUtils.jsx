import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

// Enhanced React-PDF Styles with modern design
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  
  // Header Styles
  header: {
    backgroundColor: '#2D3748',
    padding: 25,
    marginBottom: 0,
  },
  headerAccent: {
    backgroundColor: '#6366F1',
    height: 4,
    width: '100%',
  },
  brandSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 10,
    color: '#E2E8F0',
    marginTop: 5,
  },
  receiptInfo: {
    alignItems: 'flex-end',
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  receiptDetails: {
    fontSize: 9,
    color: '#CBD5E0',
    lineHeight: 1.4,
  },

  // Content Container
  content: {
    padding: 20,
    flexGrow: 1,
  },

  // Account Information Section
  accountSection: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    marginBottom: 20,
    borderRadius: 8,
    border: '1px solid #E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 9,
    color: '#6B7280',
    width: 80,
    fontWeight: 'normal',
  },
  infoValue: {
    fontSize: 9,
    color: '#1F2937',
    fontWeight: 'bold',
    flex: 1,
  },

  // Transaction Summary Box
  summaryBox: {
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    border: '2px solid',
  },
  summaryBoxCredit: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  summaryBoxDebit: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  amountLarge: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  amountCredit: {
    color: '#10B981',
  },
  amountDebit: {
    color: '#EF4444',
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  transactionType: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statusSuccess: {
    backgroundColor: '#10B981',
    color: '#ffffff',
  },
  statusPending: {
    backgroundColor: '#F59E0B',
    color: '#ffffff',
  },
  statusFailed: {
    backgroundColor: '#EF4444',
    color: '#ffffff',
  },

  // Transaction Details Table
  detailsSection: {
    marginBottom: 20,
  },
  detailsTable: {
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRowAlt: {
    backgroundColor: '#F9FAFB',
  },
  tableLabel: {
    fontSize: 9,
    color: '#6B7280',
    width: '35%',
    fontWeight: 'normal',
  },
  tableValue: {
    fontSize: 9,
    color: '#1F2937',
    fontWeight: 'bold',
    flex: 1,
  },

  // Security Section
  securitySection: {
    backgroundColor: '#F0F9FF',
    border: '1px solid #93C5FD',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  securityTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 10,
  },
  securityText: {
    fontSize: 8,
    color: '#1F2937',
    lineHeight: 1.4,
    marginBottom: 4,
  },

  // Support Section
  supportSection: {
    backgroundColor: '#F8FAFC',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  supportTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 8,
    color: '#6B7280',
    lineHeight: 1.3,
    marginBottom: 2,
  },

  // Footer
  footer: {
    backgroundColor: '#2D3748',
    padding: 15,
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 8,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 1.3,
    marginBottom: 2,
  },

  // Watermark
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 48,
    color: '#F1F5F9',
    fontWeight: 'bold',
    opacity: 0.1,
    zIndex: -1,
  },
});

// React-PDF Transaction Receipt Component
const TransactionReceiptDocument = ({ transaction, user }) => {
  const transactionAmount = parseFloat(transaction?.amount || 0);
  const isCredit = transactionAmount > 0;
  
  // Parse metadata for additional details
  let metadata = {};
  try {
    metadata = JSON.parse(transaction?.transactionMetadata || '{}');
  } catch (e) {
    metadata = {};
  }
  
  const transactionFee = parseFloat(metadata.fee) || 0;
  const netAmount = Math.abs(transactionAmount) + transactionFee;
  
  // Fixed currency formatting to prevent small "1" appearing before numbers
  const formatCurrency = (amount) => {
    if (isNaN(amount) || amount === null || amount === undefined) return '0.00';
    // Use simple number formatting without locale to avoid the "1" issue
    return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Helper function to clean currency symbols from text
  const cleanCurrencyText = (text) => {
    if (!text) return text;
    // Replace any rupee symbols (₹) with Rs. in text fields
    return text.replace(/₹/g, 'Rs.');
  };

  // Fixed net amount calculation - should be actual transaction amount, not amount + fee
  const actualNetAmount = Math.abs(transactionAmount); // Net amount is the transaction amount itself
  
  const getStatusDisplay = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'SUCCESS';
      case 'pending':
        return 'PENDING';
      case 'failed':
        return 'FAILED';
      default:
        return 'UNKNOWN';
    }
  };
  
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return styles.statusSuccess;
      case 'pending':
        return styles.statusPending;
      case 'failed':
        return styles.statusFailed;
      default:
        return styles.statusFailed;
    }
  };

  // Format ledger type for display
  const getLedgerType = () => {
    if (transaction?.ledgerType) return transaction.ledgerType;
    
    // Map transaction type to ledger type
    const typeMapping = {
      'deposit': 'TopIn',
      'transfer': 'Fund Transfer Transaction',
      'payment': 'Payment',
      'withdrawal': 'Wallet Topup',
      'commission': 'Commission',
      'refund': 'Refund'
    };
    
    return typeMapping[transaction?.transactionType] || 'TopIn via Payment Gateway Razorpay by CSP314818';
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>NEXASPAY</Text>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandSection}>
            <View>
              <Text style={styles.brandTitle}>NEXASPAY</Text>
              <Text style={styles.brandTagline}>Digital Wallet Platform</Text>
              <Text style={styles.brandTagline}>Secure - Fast - Reliable - Trusted</Text>
            </View>
            <View style={styles.receiptInfo}>
              <Text style={styles.receiptTitle}>OFFICIAL TRANSACTION RECEIPT</Text>
              <Text style={styles.receiptDetails}>
                Receipt No: RCP-{transaction?.referenceId || transaction?.referenceNumber || transaction?.id}
              </Text>
              <Text style={styles.receiptDetails}>
                Generated: {new Date().toLocaleDateString('en-GB')}
              </Text>
              <Text style={styles.receiptDetails}>
                Time: {new Date().toLocaleTimeString('en-GB', { hour12: false })}
              </Text>
              <Text style={styles.receiptDetails}>Valid Receipt</Text>
            </View>
          </View>
        </View>
        <View style={styles.headerAccent} />

        {/* Content */}
        <View style={styles.content}>
          {/* Account Information */}
          <View style={styles.accountSection}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Holder:</Text>
              <Text style={styles.infoValue}>{user?.fullName || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number:</Text>
              <Text style={styles.infoValue}>{user?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer ID:</Text>
              <Text style={styles.infoValue}>NEXAS-{user?.id || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>User Code:</Text>
              <Text style={styles.infoValue}>{transaction?.userCode || user?.phone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type:</Text>
              <Text style={styles.infoValue}>Digital Wallet</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Status:</Text>
              <Text style={styles.infoValue}>Active & Verified</Text>
            </View>
          </View>

          {/* Transaction Summary */}
          <View style={[styles.summaryBox, isCredit ? styles.summaryBoxCredit : styles.summaryBoxDebit]}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryTitle}>TRANSACTION SUMMARY</Text>
              <Text style={[styles.amountLarge, isCredit ? styles.amountCredit : styles.amountDebit]}>
                {isCredit ? '+' : '-'}Rs.{formatCurrency(Math.abs(transactionAmount))}
              </Text>
            </View>
            
            <View style={styles.summaryDetails}>
              <View>
                <Text style={styles.transactionType}>
                  Type: {(transaction?.transactionType || transaction?.type || 'TRANSACTION').replace('_', ' ').toUpperCase()}
                </Text>
                {transactionFee > 0 && (
                  <>
                    <Text style={styles.transactionType}>Transaction Fee: Rs.{formatCurrency(transactionFee)}</Text>
                    <Text style={styles.transactionType}>Net Amount: Rs.{formatCurrency(netAmount)}</Text>
                  </>
                )}
              </View>
              <View style={[styles.statusBadge, getStatusStyle(transaction?.status)]}>
                <Text>Status: {getStatusDisplay(transaction?.status)}</Text>
              </View>
            </View>
            
            <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 8 }}>
              Ref: {transaction?.referenceId || transaction?.referenceNumber || transaction?.id}
            </Text>
          </View>

          {/* Transaction Details - Enhanced with new fields */}
          <View style={styles.detailsSection}>
            <Text style={styles.sectionTitle}>Comprehensive Transaction Details</Text>
            <View style={styles.detailsTable}>
              {[
                ['Ledger Date', transaction?.ledgerDate ? new Date(transaction.ledgerDate).toLocaleDateString('en-GB') : new Date(transaction?.createdAt).toLocaleDateString('en-GB')],
                ['Transaction Date & Time', new Date(transaction?.createdAt).toLocaleString('en-GB', { 
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })],
                ['User Code', transaction?.userCode || user?.phone || 'DIPIKA KRISHNA PENDALWAR [CSP314818]'],
                ['Ledger Type', getLedgerType()],
                ['Transaction Type', (transaction?.transactionType || transaction?.type || 'TRANSACTION').replace('_', ' ').toUpperCase()],
                ['Description', transaction?.description || 'Digital Wallet Transaction'],
                ['Remarks', cleanCurrencyText(transaction?.remarks || transaction?.description || 'TopIn via Payment Gateway Razorpay by CSP314818')],
                ...(transaction?.beneficiaryName ? [['Beneficiary Name', transaction.beneficiaryName]] : []),
                ...(transaction?.beneficiaryAccount ? [['Beneficiary Account', transaction.beneficiaryAccount]] : []),
                ['Debit Amount', transactionAmount < 0 ? `Rs.${formatCurrency(Math.abs(transactionAmount))}` : 'Rs.0.00'],
                ['Credit Amount', transactionAmount > 0 ? `Rs.${formatCurrency(Math.abs(transactionAmount))}` : 'Rs.0.00'],
                ['Transaction Amount', `Rs.${formatCurrency(Math.abs(transactionAmount))}`],
                ['Transaction Fee', transactionFee > 0 ? `Rs.${formatCurrency(transactionFee)}` : 'FREE'],
                ['Net Amount', `Rs.${formatCurrency(netAmount)}`],
                ['Opening Balance', transaction?.openingBalance !== undefined ? `Rs.${formatCurrency(transaction.openingBalance)}` : 'N/A'],
                ['Closing Balance', `Rs.${formatCurrency(transaction?.balanceAfter || transaction?.closingBalance || 0)}`],
                ['Current Balance', `Rs.${formatCurrency(transaction?.balanceAfter || transaction?.closingBalance || 0)}`],
                ['Payment Method', metadata.paymentMethod || 'NEXASPAY WALLET'],
                ['Authentication', metadata.authMethod?.toUpperCase() || 'SECURE'],
                ['Processing Mode', metadata.transferType?.toUpperCase() || 'INSTANT'],
                ['Reference Number', transaction?.referenceId || transaction?.referenceNumber || transaction?.id],
              ].map(([label, value], index) => (
                <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}>
                  <Text style={styles.tableLabel}>{label}:</Text>
                  <Text style={styles.tableValue}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Security & Compliance */}
          <View style={styles.securitySection}>
            <Text style={styles.securityTitle}>SECURITY & COMPLIANCE</Text>
            <Text style={styles.securityText}>
              • This transaction has been processed using bank-grade 256-bit SSL encryption technology
            </Text>
            <Text style={styles.securityText}>
              • All transaction data is stored securely and complies with RBI guidelines and PCI DSS standards
            </Text>
            <Text style={styles.securityText}>
              • This receipt is digitally signed and can be used for accounting and tax purposes
            </Text>
            <Text style={styles.securityText}>
              • Transaction processed through secure payment gateway with real-time fraud monitoring
            </Text>
            <Text style={styles.securityText}>
              • For verification, you can check this transaction in your NEXASPAY app using the reference number
            </Text>
          </View>

          {/* Support Section */}
          <View style={styles.supportSection}>
            <Text style={styles.supportTitle}>24/7 Customer Support</Text>
            <Text style={styles.supportText}>Email: support@nexaspay.com</Text>
            <Text style={styles.supportText}>Phone: 1800-123-NEXAS (63927)</Text>
            <Text style={styles.supportText}>Live Chat: www.nexaspay.com</Text>
            <Text style={styles.supportText}>Available 24x7, 365 days</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            NEXASPAY Digital Wallet Platform - Your Trusted Financial Partner
          </Text>
          <Text style={styles.footerText}>
            Copyright {new Date().getFullYear()} NEXASPAY Technologies Pvt. Ltd. | Licensed by RBI | www.nexaspay.com
          </Text>
          <Text style={styles.footerText}>
            Document generated on: {new Date().toLocaleString('en-GB', { hour12: false })} | Version 5.0 React-PDF Enhanced
          </Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Generate enhanced PDF receipt using React-PDF with superior design
 * @param {Object} transaction - Transaction data
 * @param {Object} user - User data
 * @param {string} mode - 'download', 'share', or 'blob'
 * @returns {Promise<Blob|string>} PDF blob, data URL, or filename
 */
export const generateEnhancedTransactionPDF = async (transaction, user, mode = 'download') => {
  try {
    // Create the PDF document
    const MyDocument = <TransactionReceiptDocument transaction={transaction} user={user} />;
    
    // Generate PDF blob
    const blob = await pdf(MyDocument).toBlob();
    
    const fileName = `NEXASPAY-Enhanced-Receipt-${transaction?.referenceId || transaction?.referenceNumber || transaction?.id}-${Date.now()}.pdf`;
    
    if (mode === 'download') {
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return fileName;
    } else if (mode === 'share') {
      // Convert to data URL for sharing
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
    } else {
      // Return blob
      return blob;
    }
    
  } catch (error) {
    console.error('Error generating enhanced React-PDF:', error);
    throw new Error('Failed to generate enhanced PDF receipt: ' + error.message);
  }
};

/**
 * Generate bulk transaction ledger using React-PDF
 * @param {Array} transactions - Array of transactions
 * @param {Object} user - User data
 * @param {string} dateRange - Date range string
 * @returns {Promise<string>} PDF filename
 */
export const generateEnhancedBulkTransactionPDF = async (transactions, user) => {
  try {
    // Fixed currency formatting function - define it here for this function's scope
    const formatCurrency = (amount) => {
      if (isNaN(amount) || amount === null || amount === undefined) return '0.00';
      return parseFloat(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };
    
    // Fixed calculation logic for better net amount display
    const totalIncome = transactions.filter(t => parseFloat(t.amount) > 0).reduce((sum, t) => sum + parseFloat(t.amount), 0);
    const totalExpenses = transactions.filter(t => parseFloat(t.amount) < 0).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    const netAmount = totalIncome - totalExpenses;
    
    // Helper function to clean currency in remarks
    const cleanCurrencyInRemarks = (text) => {
      if (!text) return text;
      return text.replace(/₹/g, 'Rs.');
    };
    
    const BulkDocument = (
      <Document>
        <Page size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.header}>
            <Text style={{fontSize: 24, fontWeight: 'bold', color: '#ffffff'}}>NEXASPAY TRANSACTION LEDGER</Text>
            <Text style={{fontSize: 12, color: '#E2E8F0', marginTop: 3}}>Comprehensive Financial Report</Text>
          </View>
          <View style={styles.headerAccent} />
          
          <View style={styles.content}>
            <Text style={{fontSize: 12, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, textTransform: 'uppercase'}}>Account Summary</Text>
            <View style={{backgroundColor: '#F8FAFC', padding: 12, marginBottom: 15, borderRadius: 6, border: '1px solid #E2E8F0'}}>
              <Text style={{fontSize: 9, color: '#1F2937', marginBottom: 3}}>Account Holder: {user?.fullName || 'N/A'}</Text>
              <Text style={{fontSize: 9, color: '#1F2937', marginBottom: 3}}>User Code: {user?.phone || 'N/A'}</Text>
              <Text style={{fontSize: 9, color: '#1F2937', marginBottom: 3}}>Total Transactions: {transactions.length}</Text>
              <Text style={{fontSize: 9, color: '#1F2937', marginBottom: 3}}>Total Income: Rs.{formatCurrency(totalIncome)}</Text>
              <Text style={{fontSize: 9, color: '#1F2937', marginBottom: 3}}>Total Expenses: Rs.{formatCurrency(totalExpenses)}</Text>
              <Text style={{fontSize: 10, color: '#1F2937', fontWeight: 'bold'}}>Net Amount: Rs.{formatCurrency(Math.abs(netAmount))} {netAmount >= 0 ? '(Surplus)' : '(Deficit)'}</Text>
            </View>
            
            {/* Enhanced Transaction list with new fields */}
            <Text style={{fontSize: 12, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, textTransform: 'uppercase'}}>Transaction History</Text>
            <View style={styles.detailsTable}>
              {/* Header Row */}
              <View style={[styles.tableRow, { backgroundColor: '#E5E7EB', paddingVertical: 6 }]}>
                <Text style={{ fontSize: 8, width: '12%', fontWeight: 'bold' }}>Ledger Date</Text>
                <Text style={{ fontSize: 8, width: '15%', fontWeight: 'bold' }}>User Code</Text>
                <Text style={{ fontSize: 8, width: '18%', fontWeight: 'bold' }}>Ledger Type</Text>
                <Text style={{ fontSize: 8, width: '15%', fontWeight: 'bold' }}>Remarks</Text>
                <Text style={{ fontSize: 8, width: '10%', fontWeight: 'bold' }}>Debit</Text>
                <Text style={{ fontSize: 8, width: '10%', fontWeight: 'bold' }}>Credit</Text>
                <Text style={{ fontSize: 8, width: '10%', fontWeight: 'bold' }}>Balance</Text>
                <Text style={{ fontSize: 8, width: '10%', fontWeight: 'bold' }}>Reference</Text>
              </View>
              
              {transactions.slice(0, 20).map((transaction, index) => {
                const isCredit = transaction.amount > 0;
                const ledgerType = transaction.ledgerType || (transaction.transactionType === 'deposit' ? 'TopIn' : 
                  transaction.transactionType === 'transfer' ? 'Fund Transfer Transaction' : 
                  transaction.transactionType === 'payment' ? 'Payment' : 'Transaction');
                
                return (
                  <View key={index} style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt, { paddingVertical: 4 }]}>
                    <Text style={{ fontSize: 7, width: '12%' }}>
                      {transaction.ledgerDate ? new Date(transaction.ledgerDate).toLocaleDateString('en-GB') : 
                       new Date(transaction.createdAt).toLocaleDateString('en-GB')}
                    </Text>
                    <Text style={{ fontSize: 7, width: '15%' }}>
                      {transaction.userCode || user?.phone || 'N/A'}
                    </Text>
                    <Text style={{ fontSize: 7, width: '18%' }}>
                      {ledgerType}
                    </Text>
                    <Text style={{ fontSize: 7, width: '15%' }}>
                      {cleanCurrencyInRemarks(transaction.remarks || transaction.description || 'N/A')}
                    </Text>
                    <Text style={{ fontSize: 7, width: '10%', color: isCredit ? '#666' : '#EF4444' }}>
                      {isCredit ? 'Rs.0.00' : `Rs.${formatCurrency(Math.abs(transaction.amount))}`}
                    </Text>
                    <Text style={{ fontSize: 7, width: '10%', color: isCredit ? '#10B981' : '#666' }}>
                      {isCredit ? `Rs.${formatCurrency(Math.abs(transaction.amount))}` : 'Rs.0.00'}
                    </Text>
                    <Text style={{ fontSize: 7, width: '10%' }}>
                      Rs.{formatCurrency(transaction.balanceAfter || transaction.closingBalance || 0)}
                    </Text>
                    <Text style={{ fontSize: 7, width: '10%' }}>
                      {(transaction.referenceId || transaction.referenceNumber || transaction.id).toString().substr(-6)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              NEXASPAY Comprehensive Ledger Report - Generated: {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-GB', { hour12: false })}
            </Text>
          </View>
        </Page>
      </Document>
    );
    
    const blob = await pdf(BulkDocument).toBlob();
    const fileName = `NEXASPAY-Enhanced-Ledger-${user?.id || 'USER'}-${Date.now()}.pdf`;
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return fileName;
    
  } catch (error) {
    console.error('Error generating enhanced bulk PDF:', error);
    throw new Error('Failed to generate enhanced bulk transaction ledger: ' + error.message);
  }
};

/**
 * Enhanced sharing with React-PDF
 * @param {Object} transaction - Transaction data  
 * @param {Object} user - User data
 * @returns {Promise<boolean>} Success status
 */
export const shareEnhancedTransactionReceipt = async (transaction, user) => {
  try {
    // Generate PDF as blob using React-PDF
    const pdfBlob = await generateEnhancedTransactionPDF(transaction, user, 'blob');
    const fileName = `NEXASPAY-Enhanced-Receipt-${transaction?.referenceId || transaction?.id}.pdf`;
    
    // Try Web Share API first (mobile)
    if (navigator.share && navigator.canShare) {
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Transaction Receipt - NEXASPAY Enhanced',
          text: `Enhanced transaction receipt for Rs.${Math.abs(transaction.amount)} from NEXASPAY Digital Wallet`,
          files: [file]
        });
        return true;
      }
    }
    
    // Fallback methods same as before...
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error sharing enhanced receipt:', error);
    return false;
  }
};

// Legacy function aliases for backward compatibility with walletSlice.js
export const generateBulkTransactionPDF = generateEnhancedBulkTransactionPDF;
export const generateIndividualReceipt = generateEnhancedTransactionPDF;
export const shareTransactionReceipt = shareEnhancedTransactionReceipt;

/**
 * Print transaction receipt using browser's print functionality
 * @param {Object} transaction - Transaction data
 * @param {Object} user - User data
 * @returns {Promise<boolean>} Success status
 */
export const printTransactionReceipt = async (transaction, user) => {
  try {
    // Generate PDF as data URL for printing
    const pdfDataUrl = await generateEnhancedTransactionPDF(transaction, user, 'share');
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Could not open print window. Please allow popups.');
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>NEXASPAY Transaction Receipt</title>
          <style>
            body { margin: 0; padding: 0; }
            iframe { width: 100%; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${pdfDataUrl}" type="application/pdf"></iframe>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    return true;
    
  } catch (error) {
    console.error('Error printing receipt:', error);
    return false;
  }
};