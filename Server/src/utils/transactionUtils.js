/**
 * Generate enhanced transaction ID with format: TXN + YYYY + MM + unique number
 * Example: TXN202509001, TXN202509002, etc.
 * @returns {string} Enhanced transaction ID
 */
export const generateEnhancedTransactionId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = now.getTime();
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Format: TXN + YYYY + MM + unique number (last 3 digits of timestamp + random)
  const uniqueNumber = String(timestamp).slice(-3) + randomSuffix;
  
  return `TXN${year}${month}${uniqueNumber}`;
};

/**
 * Generate reference ID with better format
 * @param {string} prefix - Optional prefix (default: 'REF')
 * @returns {string} Reference ID
 */
export const generateReferenceId = (prefix = 'REF') => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const timestamp = now.getTime();
  
  return `${prefix}${year}${month}${day}${String(timestamp).slice(-6)}`;
};