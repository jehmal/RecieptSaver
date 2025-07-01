import AsyncStorage from '@react-native-async-storage/async-storage';
import { Receipt } from '../contexts/NormalizedReceiptContext';
import { safeToFixed } from './safeToFixed';

const OLD_STORAGE_KEY = '@infinite_receipts';
const NEW_STORAGE_KEY = '@infinite_receipts_normalized';

interface NormalizedReceiptState {
  byId: Record<string, Receipt>;
  allIds: string[];
}

/**
 * Migrates receipt data from array format to normalized format
 */
export const migrateReceiptData = async (): Promise<boolean> => {
  try {
    // Check if migration is needed
    const normalizedData = await AsyncStorage.getItem(NEW_STORAGE_KEY);
    if (normalizedData) {
      console.log('Receipts already in normalized format');
      return true;
    }

    // Load old format data
    const oldData = await AsyncStorage.getItem(OLD_STORAGE_KEY);
    if (!oldData) {
      console.log('No receipt data to migrate');
      return true;
    }

    const receipts = JSON.parse(oldData) as Receipt[];
    if (!Array.isArray(receipts)) {
      console.log('Old data is not in expected array format');
      return false;
    }

    // Convert to normalized format
    const normalized: NormalizedReceiptState = {
      byId: {},
      allIds: [],
    };

    receipts.forEach((receipt) => {
      if (receipt.id) {
        normalized.byId[receipt.id] = receipt;
        normalized.allIds.push(receipt.id);
      }
    });

    // Save normalized data
    await AsyncStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(normalized));
    
    // Optional: Remove old data after successful migration
    // await AsyncStorage.removeItem(OLD_STORAGE_KEY);
    
    console.log(`Successfully migrated ${receipts.length} receipts to normalized format`);
    return true;
  } catch (error) {
    console.error('Error during receipt migration:', error);
    return false;
  }
};

/**
 * Validates the integrity of normalized receipt data
 */
export const validateNormalizedData = (data: NormalizedReceiptState): boolean => {
  try {
    // Check that all IDs in allIds have corresponding entries in byId
    for (const id of data.allIds) {
      if (!data.byId[id]) {
        console.error(`ID ${id} in allIds but not in byId`);
        return false;
      }
    }

    // Check that all entries in byId have corresponding IDs in allIds
    const byIdKeys = Object.keys(data.byId);
    for (const id of byIdKeys) {
      if (!data.allIds.includes(id)) {
        console.error(`ID ${id} in byId but not in allIds`);
        return false;
      }
    }

    // Check that receipt IDs match their keys
    for (const [id, receipt] of Object.entries(data.byId)) {
      if (receipt.id !== id) {
        console.error(`Receipt ID mismatch: key=${id}, receipt.id=${receipt.id}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error validating normalized data:', error);
    return false;
  }
};

/**
 * Repairs normalized data if validation fails
 */
export const repairNormalizedData = (data: NormalizedReceiptState): NormalizedReceiptState => {
  const repaired: NormalizedReceiptState = {
    byId: {},
    allIds: [],
  };

  // Use a Set to track unique IDs
  const uniqueIds = new Set<string>();

  // First pass: collect all valid receipts
  for (const [id, receipt] of Object.entries(data.byId)) {
    if (receipt && receipt.id && !uniqueIds.has(receipt.id)) {
      // Ensure the receipt ID matches the key
      const correctId = receipt.id;
      repaired.byId[correctId] = { ...receipt, id: correctId };
      uniqueIds.add(correctId);
    }
  }

  // Second pass: build allIds from valid receipts
  repaired.allIds = Array.from(uniqueIds);

  // Sort allIds by creation date for consistent ordering
  repaired.allIds.sort((a, b) => {
    const receiptA = repaired.byId[a];
    const receiptB = repaired.byId[b];
    const dateA = new Date(receiptA.createdAt || receiptA.date).getTime();
    const dateB = new Date(receiptB.createdAt || receiptB.date).getTime();
    return dateB - dateA; // Newest first
  });

  return repaired;
};

/**
 * Creates an index for fast lookups by various fields
 */
export interface ReceiptIndices {
  byMerchant: Record<string, string[]>;
  byCategory: Record<string, string[]>;
  byDate: Record<string, string[]>; // YYYY-MM-DD format
  bySyncStatus: {
    synced: string[];
    unsynced: string[];
  };
}

export const createReceiptIndices = (state: NormalizedReceiptState): ReceiptIndices => {
  const indices: ReceiptIndices = {
    byMerchant: {},
    byCategory: {},
    byDate: {},
    bySyncStatus: {
      synced: [],
      unsynced: [],
    },
  };

  for (const id of state.allIds) {
    const receipt = state.byId[id];
    if (!receipt) continue;

    // Index by merchant
    const merchant = receipt.merchant.toLowerCase();
    if (!indices.byMerchant[merchant]) {
      indices.byMerchant[merchant] = [];
    }
    indices.byMerchant[merchant].push(id);

    // Index by category
    const category = receipt.category || 'uncategorized';
    if (!indices.byCategory[category]) {
      indices.byCategory[category] = [];
    }
    indices.byCategory[category].push(id);

    // Index by date (YYYY-MM-DD)
    const dateKey = receipt.date.split('T')[0];
    if (!indices.byDate[dateKey]) {
      indices.byDate[dateKey] = [];
    }
    indices.byDate[dateKey].push(id);

    // Index by sync status
    if (receipt.isSynced) {
      indices.bySyncStatus.synced.push(id);
    } else {
      indices.bySyncStatus.unsynced.push(id);
    }
  }

  return indices;
};

/**
 * Performance comparison utility
 */
export const comparePerformance = async () => {
  const iterations = 1000;
  const testId = 'test-receipt-123';

  // Load array format
  const arrayData = await AsyncStorage.getItem(OLD_STORAGE_KEY);
  const receipts = arrayData ? JSON.parse(arrayData) as Receipt[] : [];

  // Load normalized format
  const normalizedData = await AsyncStorage.getItem(NEW_STORAGE_KEY);
  const normalized = normalizedData ? JSON.parse(normalizedData) as NormalizedReceiptState : { byId: {}, allIds: [] };

  // Test array lookup
  const arrayStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    receipts.find(r => r.id === testId);
  }
  const arrayTime = performance.now() - arrayStart;

  // Test normalized lookup
  const normalizedStart = performance.now();
  for (let i = 0; i < iterations; i++) {
    normalized.byId[testId];
  }
  const normalizedTime = performance.now() - normalizedStart;

  console.log(`Performance comparison (${iterations} iterations):`);
  console.log(`Array lookup: ${safeToFixed(arrayTime, 2)}ms`);
  console.log(`Normalized lookup: ${safeToFixed(normalizedTime, 2)}ms`);
  console.log(`Improvement: ${safeToFixed((arrayTime / normalizedTime) * 100, 0)}%`);

  return {
    arrayTime,
    normalizedTime,
    improvement: arrayTime / normalizedTime,
  };
};