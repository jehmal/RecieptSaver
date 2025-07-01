import { Receipt } from '../contexts/ReceiptContext';
import { safeToFixed } from './safeToFixed';

/**
 * Ensures receipt data has the correct types
 * Particularly useful when data might come from different sources
 * or when dealing with JSON parsing that might convert numbers to strings
 */
export const normalizeReceipt = (receipt: Receipt): Receipt => {
  // Ensure amount is a valid number
  let normalizedAmount: number = 0;
  
  if (receipt.amount !== undefined && receipt.amount !== null) {
    if (typeof receipt.amount === 'string') {
      // Remove currency symbols and commas before parsing
      const cleanedAmount = receipt.amount.toString().replace(/[$,]/g, '');
      normalizedAmount = parseFloat(cleanedAmount);
    } else if (typeof receipt.amount === 'number') {
      normalizedAmount = receipt.amount;
    } else {
      // Handle any other type by converting to string first
      const stringAmount = String(receipt.amount).replace(/[$,]/g, '');
      normalizedAmount = parseFloat(stringAmount);
    }
    
    // Fallback to 0 if parsing failed
    if (!Number.isFinite(normalizedAmount)) {
      console.warn('normalizeReceipt: Invalid amount value:', receipt.amount);
      normalizedAmount = 0;
    }
  }
  
  return {
    ...receipt,
    amount: normalizedAmount,
    // Ensure other required fields have proper defaults
    imageUri: receipt.imageUri || '',
    createdAt: receipt.createdAt || new Date().toISOString(),
    updatedAt: receipt.updatedAt || new Date().toISOString(),
    isSynced: receipt.isSynced !== undefined ? receipt.isSynced : true,
  };
};

/**
 * Formats a currency amount for display
 * Handles edge cases like NaN or undefined values
 */
export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) {
    return '$0.00';
  }
  
  // Handle various types that might come through
  let numAmount: number;
  
  if (typeof amount === 'string') {
    // Remove any currency symbols or commas before parsing
    const cleanedAmount = amount.replace(/[$,]/g, '');
    numAmount = parseFloat(cleanedAmount);
  } else if (typeof amount === 'number') {
    numAmount = amount;
  } else {
    // Fallback for any other type
    console.warn('formatCurrency received unexpected type:', typeof amount, amount);
    return '$0.00';
  }
  
  // Check if the parsed value is a valid number
  if (!Number.isFinite(numAmount)) {
    console.warn('formatCurrency could not parse valid number from:', amount);
    return '$0.00';
  }
  
  // Use safeToFixed for guaranteed safety
  // Note: We're still passing numAmount which should be a number at this point,
  // but safeToFixed adds an extra layer of protection
  return `$${safeToFixed(numAmount, 2)}`;
};

/**
 * Safely parses an amount that might be a string or number
 */
export const parseAmount = (amount: string | number): number => {
  if (typeof amount === 'number') {
    return amount;
  }
  
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? 0 : parsed;
};