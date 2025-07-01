# SafeToFixed Utility Usage Guide

## Overview

The `safeToFixed` utility is a defensive wrapper around JavaScript's `Number.prototype.toFixed()` method, specifically designed to handle edge cases that occur in React Native Web applications.

## Problem It Solves

React Native Web's color normalization process sometimes creates Number objects using `new Number()`, which can cause runtime errors when `toFixed()` is called. This utility ensures that all numeric conversions are handled safely.

### Common Error Scenario
```javascript
// React Native Web might create:
const colorValue = new Number(128.5);

// This causes an error in some environments:
colorValue.toFixed(0); // Error: toFixed is not a function

// Our utility handles this gracefully:
safeToFixed(colorValue, 0); // "129"
```

## API Reference

### safeToFixed(value, decimals)

Safely converts any value to a fixed-point notation string.

**Parameters:**
- `value: any` - The value to convert (handles numbers, strings, Number objects, etc.)
- `decimals: number` - Number of decimal places (0-100, defaults to 0)

**Returns:** `string` - The formatted number or "0.00" for invalid inputs

**Examples:**
```typescript
import { safeToFixed } from '@/utils/safeToFixed';

// Basic usage
safeToFixed(3.14159, 2);          // "3.14"
safeToFixed(new Number(1.5), 1);  // "1.5"
safeToFixed("42.5", 2);           // "42.50"

// Edge cases
safeToFixed(null, 2);             // "0.00"
safeToFixed(NaN, 2);              // "0.00"
safeToFixed(Infinity, 2);         // "0.00"
```

### isFiniteNumber(value)

Type guard to check if a value is a finite number.

**Parameters:**
- `value: any` - The value to check

**Returns:** `boolean` - True if the value is a finite number

**Examples:**
```typescript
isFiniteNumber(42);               // true
isFiniteNumber(new Number(42));   // true
isFiniteNumber(NaN);              // false
isFiniteNumber("42");             // false
```

### safeToFixedBatch(values, decimals)

Process multiple values at once (useful for RGB values).

**Parameters:**
- `values: any[]` - Array of values to process
- `decimals: number` - Number of decimal places for all values

**Returns:** `string[]` - Array of formatted strings

**Examples:**
```typescript
// RGB color processing
const rgb = [255, new Number(128.5), "64.25"];
safeToFixedBatch(rgb, 0);        // ["255", "129", "64"]

// Mixed values
const mixed = [42, null, NaN, "100"];
safeToFixedBatch(mixed, 2);      // ["42.00", "0.00", "0.00", "100.00"]
```

## Integration with React Native Web

### Color Style Processing

When React Native Web processes color styles, it might create Number objects that need special handling:

```typescript
// In your style normalization code
const normalizeColorValue = (value: any): string => {
  // Safely handle any numeric value
  return safeToFixed(value, 0);
};

// Example with RGB processing
const processRGB = (r: any, g: any, b: any): string => {
  const [red, green, blue] = safeToFixedBatch([r, g, b], 0);
  return `rgb(${red}, ${green}, ${blue})`;
};
```

### Component Usage

```tsx
import { safeToFixed } from '@/utils/safeToFixed';

const PriceDisplay = ({ amount }: { amount: any }) => {
  // Safely format any amount value
  const formattedAmount = safeToFixed(amount, 2);
  
  return <Text>${formattedAmount}</Text>;
};
```

## ESLint Configuration

The project includes an ESLint rule to discourage direct `toFixed` usage:

```javascript
// .eslintrc.js
{
  'no-restricted-syntax': [
    'warn',
    {
      selector: 'CallExpression[callee.property.name="toFixed"]',
      message: 'Avoid using toFixed directly. Use safeToFixed from utils/safeToFixed instead.'
    }
  ]
}
```

If you must use `toFixed` directly (not recommended), disable the rule:
```javascript
// eslint-disable-next-line no-restricted-syntax
value.toFixed(2);
```

## Best Practices

1. **Always use safeToFixed for user-facing values**
   ```typescript
   // Good
   const display = safeToFixed(userInput, 2);
   
   // Bad
   const display = userInput.toFixed(2); // Can throw errors
   ```

2. **Use batch processing for related values**
   ```typescript
   // Good - Process RGB values together
   const [r, g, b] = safeToFixedBatch(rgbValues, 0);
   
   // Less efficient - Individual calls
   const r = safeToFixed(rgbValues[0], 0);
   const g = safeToFixed(rgbValues[1], 0);
   const b = safeToFixed(rgbValues[2], 0);
   ```

3. **Validate before critical operations**
   ```typescript
   if (isFiniteNumber(value)) {
     // Safe to perform numeric operations
     const result = value * 100;
   } else {
     // Handle invalid input
     console.warn('Invalid numeric value:', value);
   }
   ```

## Development Mode Features

In development mode (`__DEV__ === true`), the utility provides helpful warnings:

- Warns when non-numeric values are passed
- Logs the type of invalid inputs
- Helps identify where invalid data originates

## Testing

The utility includes comprehensive unit tests. Run them with:
```bash
npm test src/utils/__tests__/safeToFixed.test.ts
```

## Migration Guide

To migrate existing code:

1. Search for all `.toFixed(` occurrences
2. Import `safeToFixed` from utils
3. Replace `value.toFixed(n)` with `safeToFixed(value, n)`
4. Test thoroughly, especially with edge cases

Example migration:
```typescript
// Before
const formatted = amount.toFixed(2);

// After
import { safeToFixed } from '@/utils/safeToFixed';
const formatted = safeToFixed(amount, 2);
```