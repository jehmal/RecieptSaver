/**
 * Development helpers for testing and debugging
 */

import { Receipt } from '../contexts/ReceiptContext';
import { formatCurrency, normalizeReceipt } from './receiptHelpers';
import { safeToFixed } from './safeToFixed';

// Re-export safeToFixed for backward compatibility
export { safeToFixed };


/**
 * Development-time toFixed error detection and analysis
 * Note: The actual patch is applied in webStylePatches.ts
 */
export const toFixedErrorAnalyzer = {
  errors: [] as Array<{
    value: any;
    type: string;
    stack: string;
    timestamp: Date;
    location: string;
  }>,
  
  /**
   * Analyze a toFixed error and provide debugging information
   */
  analyzeError(value: any, stack?: string) {
    const error = {
      value,
      type: typeof value,
      stack: stack || new Error().stack || '',
      timestamp: new Date(),
      location: this.extractLocation(stack || new Error().stack || '')
    };
    
    this.errors.push(error);
    
    // Provide specific guidance based on the error pattern
    if (value instanceof Number) {
      console.warn(
        '[toFixed Analysis] Number object detected',
        '\n  Common in React Native Web color processing',
        '\n  Solution: Use safeToFixed() or value.valueOf()'
      );
    } else if (value === null || value === undefined) {
      console.warn(
        '[toFixed Analysis] Null/undefined value',
        '\n  Check your data flow and provide defaults',
        '\n  Solution: Use nullish coalescing: value ?? 0'
      );
    } else if (typeof value === 'object') {
      console.warn(
        '[toFixed Analysis] Object passed to toFixed',
        '\n  Object:', value,
        '\n  Solution: Extract numeric value first'
      );
    }
    
    // Check for React Native Web patterns
    if (stack?.includes('normalizeColor') || stack?.includes('processColor')) {
      console.warn(
        '[toFixed Analysis] React Native Web color processing error',
        '\n  This is a known issue with RNW style normalization',
        '\n  Our patches should handle this automatically'
      );
    }
  },
  
  /**
   * Extract meaningful location from stack trace
   */
  extractLocation(stack: string): string {
    const lines = stack.split('\n');
    for (const line of lines.slice(2, 5)) { // Skip first two lines
      if (!line.includes('developmentHelpers') && 
          !line.includes('webStylePatches') &&
          !line.includes('safeToFixed')) {
        const match = line.match(/at\s+(\S+)\s+\((.+):(\d+):(\d+)\)/);
        if (match) {
          return `${match[1]} at ${match[2]}:${match[3]}`;
        }
      }
    }
    return 'Unknown location';
  },
  
  /**
   * Get summary of toFixed errors
   */
  getSummary() {
    const summary = {
      totalErrors: this.errors.length,
      byType: {} as Record<string, number>,
      byLocation: {} as Record<string, number>,
      recentErrors: this.errors.slice(-5)
    };
    
    this.errors.forEach(error => {
      summary.byType[error.type] = (summary.byType[error.type] || 0) + 1;
      summary.byLocation[error.location] = (summary.byLocation[error.location] || 0) + 1;
    });
    
    return summary;
  },
  
  /**
   * Clear error history
   */
  clear() {
    this.errors = [];
  }
};

/**
 * Test the safeToFixed function with various inputs
 */
export const testSafeToFixed = () => {
  console.log('=== Testing safeToFixed Function ===');
  
  const testCases = [
    { value: 123.456, digits: 2, expected: '123.46', description: 'Normal number' },
    { value: '123.456', digits: 2, expected: '123.46', description: 'String number' },
    { value: '$123.456', digits: 2, expected: '123.46', description: 'String with dollar sign' },
    { value: '1,234.567', digits: 2, expected: '1234.57', description: 'String with comma' },
    { value: null, digits: 2, expected: '0.00', description: 'Null value' },
    { value: undefined, digits: 2, expected: '0.00', description: 'Undefined value' },
    { value: NaN, digits: 2, expected: '0.00', description: 'NaN value' },
    { value: Infinity, digits: 2, expected: '0.00', description: 'Infinity value' },
    { value: 0, digits: 2, expected: '0.00', description: 'Zero' },
    { value: -123.456, digits: 2, expected: '-123.46', description: 'Negative number' },
    { value: '   123.456   ', digits: 2, expected: '123.46', description: 'String with spaces' },
    { value: '', digits: 2, expected: '0.00', description: 'Empty string' },
    { value: '123.456789', digits: 4, expected: '123.4568', description: 'Many decimal places' },
    { value: 'abc', digits: 2, expected: '0.00', description: 'Non-numeric string' },
    { value: {}, digits: 2, expected: '0.00', description: 'Object (edge case)' },
    { value: [], digits: 2, expected: '0.00', description: 'Array (edge case)' },
    { value: 99.999, digits: 2, expected: '100.00', description: 'Rounding up' },
    { value: 99.994, digits: 2, expected: '99.99', description: 'Rounding down' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(({ value, digits, expected, description }) => {
    try {
      const result = safeToFixed(value, digits);
      const success = result === expected;
      
      if (success) {
        console.log(`✅ ${description}: ${result} (expected: ${expected})`);
        passed++;
      } else {
        console.error(`❌ ${description}: ${result} (expected: ${expected})`);
        failed++;
      }
    } catch (error) {
      console.error(`❌ ${description}: Error thrown:`, error);
      failed++;
    }
  });
  
  console.log(`\n=== Test Results: ${passed} passed, ${failed} failed ===\n`);
};

/**
 * Test various receipt amount formats to ensure toFixed error is fixed
 */
export const testReceiptAmountHandling = () => {
  console.log('=== Testing Receipt Amount Handling ===');
  
  const testCases = [
    { amount: 123.45, description: 'Normal number' },
    { amount: '123.45', description: 'String number' },
    { amount: '$123.45', description: 'String with dollar sign' },
    { amount: '1,234.56', description: 'String with comma' },
    { amount: null, description: 'Null value' },
    { amount: undefined, description: 'Undefined value' },
    { amount: NaN, description: 'NaN value' },
    { amount: Infinity, description: 'Infinity value' },
    { amount: 0, description: 'Zero' },
    { amount: -123.45, description: 'Negative number' },
    { amount: '   123.45   ', description: 'String with spaces' },
    { amount: '', description: 'Empty string' },
    { amount: '123.456789', description: 'Many decimal places' },
    { amount: 'abc', description: 'Non-numeric string' },
    { amount: {}, description: 'Object (edge case)' },
    { amount: [], description: 'Array (edge case)' },
  ];
  
  testCases.forEach(({ amount, description }) => {
    try {
      // Test formatCurrency directly
      const formatted = formatCurrency(amount as any);
      console.log(`✅ formatCurrency(${description}): ${formatted}`);
      
      // Test through normalizeReceipt
      const receipt: Receipt = {
        id: 'test',
        merchant: 'Test Merchant',
        amount: amount as any,
        date: new Date().toISOString(),
        imageUri: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isSynced: true,
      };
      
      const normalized = normalizeReceipt(receipt);
      console.log(`   normalizeReceipt amount: ${normalized.amount} (type: ${typeof normalized.amount})`);
      
      // Test that normalized amount can be formatted
      const normalizedFormatted = formatCurrency(normalized.amount);
      console.log(`   Formatted after normalize: ${normalizedFormatted}`);
      
    } catch (error) {
      console.error(`❌ Error with ${description}:`, error);
    }
    
    console.log('---');
  });
  
  console.log('=== Test Complete ===');
};

/**
 * Create test receipts with various amount formats
 */
export const createTestReceipts = (): Receipt[] => {
  const baseDate = new Date();
  
  return [
    {
      id: 'test1',
      merchant: 'Number Amount Store',
      amount: 123.45,
      date: baseDate.toISOString(),
      category: 'Test',
      imageUri: 'https://via.placeholder.com/400x600',
      createdAt: baseDate.toISOString(),
      updatedAt: baseDate.toISOString(),
      isSynced: true,
    },
    {
      id: 'test2',
      merchant: 'String Amount Store',
      amount: '67.89' as any, // Simulating string amount
      date: new Date(baseDate.getTime() - 86400000).toISOString(),
      category: 'Test',
      imageUri: 'https://via.placeholder.com/400x600',
      createdAt: new Date(baseDate.getTime() - 86400000).toISOString(),
      updatedAt: new Date(baseDate.getTime() - 86400000).toISOString(),
      isSynced: true,
    },
    {
      id: 'test3',
      merchant: 'Currency String Store',
      amount: '$234.56' as any, // Simulating string with currency
      date: new Date(baseDate.getTime() - 172800000).toISOString(),
      category: 'Test',
      imageUri: 'https://via.placeholder.com/400x600',
      createdAt: new Date(baseDate.getTime() - 172800000).toISOString(),
      updatedAt: new Date(baseDate.getTime() - 172800000).toISOString(),
      isSynced: true,
    },
    {
      id: 'test4',
      merchant: 'Null Amount Store',
      amount: null as any, // Simulating null amount
      date: new Date(baseDate.getTime() - 259200000).toISOString(),
      category: 'Test',
      imageUri: 'https://via.placeholder.com/400x600',
      createdAt: new Date(baseDate.getTime() - 259200000).toISOString(),
      updatedAt: new Date(baseDate.getTime() - 259200000).toISOString(),
      isSynced: true,
    },
  ];
};

/**
 * Log receipt data to help debug issues
 */
export const debugReceipt = (receipt: Receipt, label: string = 'Receipt') => {
  console.log(`=== ${label} ===`);
  console.log('ID:', receipt.id);
  console.log('Merchant:', receipt.merchant);
  console.log('Amount:', receipt.amount, `(type: ${typeof receipt.amount})`);
  console.log('Formatted Amount:', formatCurrency(receipt.amount));
  console.log('Date:', receipt.date);
  console.log('Full object:', JSON.stringify(receipt, null, 2));
  console.log('================');
};

/**
 * Test React Native Web style processing to verify patches work
 */
export const testWebStylePatches = () => {
  console.log('=== Testing Web Style Patches ===');
  
  const testCases = [
    {
      name: 'Number object (RNW color issue)',
      value: new Number(0.5),
      expected: '0.50'
    },
    {
      name: 'Invalid Number object',
      value: new Number(NaN),
      expected: '0.00'
    },
    {
      name: 'Infinity',
      value: Infinity,
      expected: '0.00'
    },
    {
      name: 'Very small number',
      value: 0.0000001,
      expected: '0.00'
    },
    {
      name: 'Null value',
      value: null,
      expected: '0.00'
    },
    {
      name: 'Object (edge case)',
      value: { valueOf: () => 0.5 },
      expected: '0.50'
    }
  ];
  
  console.log('Testing toFixed calls that would normally error in RNW:');
  
  testCases.forEach(({ name, value, expected }) => {
    try {
      // Test calling toFixed on the value directly
      const result = (value as any).toFixed(2);
      const passed = result === expected;
      
      if (passed) {
        console.log(`✅ ${name}: ${result}`);
      } else {
        console.log(`❌ ${name}: Got ${result}, expected ${expected}`);
      }
    } catch (error) {
      console.error(`❌ ${name}: Error thrown:`, error);
    }
  });
  
  // Test if patches are applied
  const isPatched = (Number.prototype.toFixed as any).__patched === true;
  console.log(`\nPatches applied: ${isPatched ? '✅ Yes' : '❌ No'}`);
  
  // Show error summary if available
  if (toFixedErrorAnalyzer.errors.length > 0) {
    console.log('\ntoFixed Error Summary:');
    console.log(toFixedErrorAnalyzer.getSummary());
  }
  
  console.log('=== Test Complete ===');
};

/**
 * Monitor toFixed calls in real-time
 */
export const monitorToFixedCalls = (duration: number = 5000) => {
  console.log(`[toFixed Monitor] Starting monitoring for ${duration}ms...`);
  
  let callCount = 0;
  const calls: Array<{ value: any; digits: number; timestamp: number }> = [];
  
  // Temporarily wrap toFixed to log calls
  const originalToFixed = Number.prototype.toFixed;
  Number.prototype.toFixed = function(digits?: number) {
    callCount++;
    calls.push({
      value: this,
      digits: digits ?? 0,
      timestamp: Date.now()
    });
    
    if (callCount % 100 === 0) {
      console.log(`[toFixed Monitor] ${callCount} calls intercepted`);
    }
    
    return originalToFixed.call(this, digits);
  };
  
  // Restore after duration
  setTimeout(() => {
    Number.prototype.toFixed = originalToFixed;
    
    console.log(`[toFixed Monitor] Monitoring complete`);
    console.log(`Total calls: ${callCount}`);
    
    // Analyze patterns
    const byType = new Map<string, number>();
    calls.forEach(call => {
      const type = call.value instanceof Number ? 'Number object' : typeof call.value;
      byType.set(type, (byType.get(type) || 0) + 1);
    });
    
    console.log('Calls by type:');
    byType.forEach((count, type) => {
      console.log(`  ${type}: ${count}`);
    });
    
    // Show problematic calls
    const problematic = calls.filter(call => 
      call.value instanceof Number ||
      !isFinite(Number(call.value))
    );
    
    if (problematic.length > 0) {
      console.log(`\nProblematic calls: ${problematic.length}`);
      console.log('Sample:', problematic.slice(0, 5));
    }
  }, duration);
};