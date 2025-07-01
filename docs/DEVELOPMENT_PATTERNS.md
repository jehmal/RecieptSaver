# Development Patterns

## Receipt Amount Handling Pattern

### Problem
The application was experiencing `toFixed is not a function` errors when displaying receipt amounts. This occurred because receipt amounts could be either numbers or strings depending on the data source (API, OCR, user input).

### Solution
We implemented a comprehensive solution using two utility functions:

1. **`normalizeReceipt()`** - Ensures receipt data has correct types
   - Converts amount to a number regardless of input type
   - Handles edge cases (null, undefined, currency symbols, commas)
   - Applied at navigation boundaries to ensure consistency

2. **`formatCurrency()`** - Safely formats amounts for display
   - Accepts number, string, null, or undefined
   - Always returns a properly formatted currency string
   - Handles all edge cases gracefully

### Implementation Pattern

#### ❌ Don't do this:
```typescript
// Direct use of toFixed on potentially non-number values
<Text>${receipt.amount.toFixed(2)}</Text>
```

#### ✅ Do this instead:
```typescript
import { formatCurrency } from '../../utils/receiptHelpers';

// Safe formatting
<Text>{formatCurrency(receipt.amount)}</Text>
```

#### At Navigation Boundaries:
```typescript
import { normalizeReceipt } from '../../utils/receiptHelpers';

// Normalize data before navigation
navigation.navigate('ReceiptDetailScreen', { 
  receipt: normalizeReceipt(receipt)
});
```

### Files Updated
- `/src/utils/receiptHelpers.ts` - Core utility functions
- `/src/components/search/ReceiptListItem.tsx` - Fixed direct toFixed usage
- `/src/components/search/SelectableReceiptListItem.tsx` - Fixed direct toFixed usage
- `/src/components/gallery/ReceiptCard.tsx` - Fixed direct toFixed usage
- `/src/components/home/DailySummaryCard.tsx` - Fixed direct toFixed usage
- `/src/screens/HomeScreen.tsx` - Added normalization at navigation
- `/src/screens/SearchScreen.tsx` - Added normalization at navigation
- `/src/screens/GalleryScreen.tsx` - Added normalization at navigation

### Testing
Use the development helpers to test amount handling:

```typescript
import { testReceiptAmountHandling } from './utils/developmentHelpers';

// Run comprehensive tests
testReceiptAmountHandling();
```

This pattern ensures type safety and prevents runtime errors regardless of the data source.

## Safe Number Formatting Pattern

### Problem
JavaScript's `toFixed()` method throws errors when called on non-number values. This is a common source of runtime errors when dealing with data from various sources (APIs, user input, storage).

### Solution
We created a global `safeToFixed()` utility function that:
1. Handles all input types gracefully (numbers, strings, null, undefined, objects)
2. Provides development-time warnings for improper usage
3. Returns a safe default value for invalid inputs
4. Includes a development-time interceptor to catch direct `toFixed()` calls

### Implementation

#### The Safe Wrapper
```typescript
import { safeToFixed } from '../../utils/developmentHelpers';

// Safe usage with various input types
safeToFixed(123.456)        // '123.46'
safeToFixed('123.456')      // '123.46'
safeToFixed('$123.45')      // '123.45'
safeToFixed(null)           // '0.00'
safeToFixed(undefined)      // '0.00'
safeToFixed('abc')          // '0.00'

// Custom digits and default value
safeToFixed(123.456789, 4)           // '123.4568'
safeToFixed(null, 2, 'N/A')          // 'N/A'
```

#### ❌ Avoid Direct toFixed Usage:
```typescript
// eslint-disable-next-line no-direct-tofixed
value.toFixed(2)  // Dangerous - can throw errors
```

#### ✅ Use safeToFixed Instead:
```typescript
safeToFixed(value, 2)  // Safe - handles all edge cases
```

### Development-Time Protection
In development mode, the app:
1. **Warns** when `safeToFixed` receives non-numeric types
2. **Intercepts** direct `toFixed()` calls and logs errors with stack traces
3. **Suggests** using `safeToFixed()` for safer code

### Testing
```typescript
import { testSafeToFixed } from './utils/developmentHelpers';

// Run comprehensive tests
testSafeToFixed();
```

### Best Practices
1. **Always use `safeToFixed()`** instead of direct `toFixed()` calls
2. **Add lint comments** when you must use direct `toFixed()` (rare cases)
3. **Test edge cases** using the provided test utilities
4. **Check console warnings** in development to catch improper usage early

### Migration Guide
To migrate existing code:
```typescript
// Before
const formatted = someValue.toFixed(2);

// After
import { safeToFixed } from '../../utils/developmentHelpers';
const formatted = safeToFixed(someValue, 2);
```

This pattern prevents `toFixed is not a function` errors and provides better debugging information during development.