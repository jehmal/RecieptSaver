// Store the original toFixed implementation to avoid recursion
let originalToFixed: typeof Number.prototype.toFixed | null = null;

/**
 * Sets the original toFixed implementation to use internally
 * This is called by webStylePatches to avoid infinite recursion
 */
export function setOriginalToFixed(original: typeof Number.prototype.toFixed) {
  originalToFixed = original;
}

/**
 * Safe wrapper for toFixed() that handles various input types gracefully
 * 
 * @param value - The value to format
 * @param digits - Number of digits after decimal point (default: 2)
 * @param defaultValue - Value to return when input is invalid (default: '0.00')
 * @returns Formatted string with specified decimal places
 * 
 * @example
 * safeToFixed(123.456) // '123.46'
 * safeToFixed('123.456') // '123.46'
 * safeToFixed(null) // '0.00'
 * safeToFixed('$123.45') // '123.45'
 * safeToFixed('abc') // '0.00'
 */
export const safeToFixed = (
  value: any,
  digits: number = 2,
  defaultValue: string = '0.00'
): string => {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return defaultValue;
  }

  // Handle Number objects (e.g., new Number(1))
  if (value instanceof Number || (typeof value === 'object' && value.constructor === Number)) {
    // Convert Number object to primitive silently
    value = Number(value.valueOf());
  }

  // Convert to number
  let numValue: number;
  
  if (typeof value === 'number') {
    numValue = value;
  } else if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleanValue = value.replace(/[$,]/g, '').trim();
    numValue = parseFloat(cleanValue);
  } else {
    // For any other type, try to convert
    numValue = Number(value);
  }

  // Check if conversion resulted in valid number
  if (isNaN(numValue) || !isFinite(numValue)) {
    return defaultValue;
  }

  // Apply toFixed safely using the original implementation
  try {
    // Use the original toFixed if available, otherwise use the prototype method
    // This prevents infinite recursion when toFixed is patched
    if (originalToFixed) {
      return originalToFixed.call(numValue, digits);
    } else {
      // Fallback: directly call the method (this should only happen before patches are applied)
      return numValue.toFixed(digits);
    }
  } catch (error) {
    if (__DEV__) {
      console.error('[safeToFixed] Error calling toFixed:', error);
    }
    return defaultValue;
  }
};