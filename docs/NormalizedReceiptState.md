# Normalized Receipt State Documentation

## Overview

The normalized receipt state structure transforms the receipt storage from a simple array to an indexed structure, providing O(1) lookup performance instead of O(n).

## State Structure

```typescript
interface NormalizedReceiptState {
  byId: Record<string, Receipt>;  // { [id]: Receipt }
  allIds: string[];               // Ordered array of IDs
}
```

### Before (Array-based):
```typescript
const receipts = [
  { id: '1', merchant: 'Store A', amount: 50 },
  { id: '2', merchant: 'Store B', amount: 75 },
  // ... potentially thousands more
];

// Finding a receipt: O(n)
const receipt = receipts.find(r => r.id === '2');
```

### After (Normalized):
```typescript
const state = {
  byId: {
    '1': { id: '1', merchant: 'Store A', amount: 50 },
    '2': { id: '2', merchant: 'Store B', amount: 75 },
  },
  allIds: ['1', '2']
};

// Finding a receipt: O(1)
const receipt = state.byId['2'];
```

## Benefits

1. **O(1) Lookups**: Direct access by ID without iteration
2. **Efficient Updates**: No need to map through entire array
3. **Memory Efficiency**: Single source of truth, no duplicates
4. **Predictable Performance**: Consistent lookup times regardless of data size
5. **Easy Ordering**: `allIds` maintains insertion order

## Migration Guide

### Step 1: Update Context Import

```typescript
// Old
import { ReceiptProvider } from './contexts/ReceiptContext';

// New
import { ReceiptProvider } from './contexts/NormalizedReceiptContext';
```

### Step 2: Use Performance-Optimized Hooks

```typescript
// Old way - O(n) lookup
const receipt = receipts.find(r => r.id === id);

// New way - O(1) lookup
const receipt = useReceiptById(id);
```

### Step 3: Leverage Specialized Hooks

```typescript
import {
  useReceiptById,          // Get single receipt by ID
  useReceiptsByIds,        // Get multiple receipts by IDs
  useFilteredReceipts,     // Filter with custom predicate
  useReceiptsByMerchant,   // Get by merchant name
  useUnsyncedReceipts,     // Get all unsynced
  useReceiptStats,         // Get statistics
  useSortedReceipts,       // Get sorted list
  useBatchReceiptOperations // Batch updates/deletes
} from '../hooks/useNormalizedReceipts';
```

## API Reference

### Context Hooks

#### `useReceiptData()`
Returns the receipt data state.
```typescript
const { receipts, receiptById, receiptIds, isLoading, error } = useReceiptData();
```

#### `useReceiptActions()`
Returns receipt manipulation actions (stable references).
```typescript
const { addReceipt, updateReceipt, deleteReceipt, getReceipt, syncReceipts } = useReceiptActions();
```

### Performance Hooks

#### `useReceiptById(id: string)`
O(1) lookup for a single receipt.
```typescript
const receipt = useReceiptById('receipt-123');
```

#### `useReceiptsByIds(ids: string[])`
Get multiple receipts efficiently.
```typescript
const selectedReceipts = useReceiptsByIds(['id1', 'id2', 'id3']);
```

#### `useFilteredReceipts(predicate: (receipt: Receipt) => boolean)`
Filter receipts with a custom function.
```typescript
const expensiveReceipts = useFilteredReceipts(r => r.amount > 100);
```

#### `useBatchReceiptOperations()`
Perform batch operations efficiently.
```typescript
const { batchUpdate, batchDelete } = useBatchReceiptOperations();

// Update multiple receipts at once
await batchUpdate([
  { id: 'id1', data: { isSynced: true } },
  { id: 'id2', data: { isSynced: true } }
]);
```

## Performance Comparison

| Operation | Array-based | Normalized | Improvement |
|-----------|-------------|------------|-------------|
| Find by ID | O(n) | O(1) | ~1000x for large datasets |
| Update by ID | O(n) | O(1) | ~1000x for large datasets |
| Delete by ID | O(n) | O(1) | ~1000x for large datasets |
| Get all | O(1) | O(n) | Same (but n operations for denormalization) |
| Filter | O(n) | O(n) | Same |
| Sort | O(n log n) | O(n log n) | Same |

## Storage Format

The data is stored in AsyncStorage as JSON:

```json
{
  "byId": {
    "receipt-123": {
      "id": "receipt-123",
      "merchant": "Store Name",
      "amount": 99.99,
      "date": "2024-01-15T10:30:00Z",
      "isSynced": true
    }
  },
  "allIds": ["receipt-123", "receipt-456", "receipt-789"]
}
```

## Best Practices

1. **Always use specialized hooks** instead of accessing raw data
2. **Prefer batch operations** when updating multiple receipts
3. **Use memoized selectors** for complex computations
4. **Leverage O(1) lookups** instead of array methods
5. **Keep allIds in sync** with byId for data integrity

## Troubleshooting

### Data Validation
```typescript
import { validateNormalizedData } from '../utils/receiptMigration';

const isValid = validateNormalizedData(normalizedState);
```

### Data Repair
```typescript
import { repairNormalizedData } from '../utils/receiptMigration';

const repaired = repairNormalizedData(corruptedState);
```

### Performance Testing
```typescript
import { comparePerformance } from '../utils/receiptMigration';

const results = await comparePerformance();
console.log(`Performance improvement: ${results.improvement}x`);
```