import { useMemo, useCallback } from 'react';
import { useReceiptData, useReceiptActions } from '../contexts/NormalizedReceiptContext';
import { Receipt } from '../contexts/NormalizedReceiptContext';

// Helper hooks for common operations with normalized receipts

/**
 * Hook to get a single receipt by ID with O(1) lookup
 */
export const useReceiptById = (id: string | undefined): Receipt | undefined => {
  const { receiptById } = useReceiptData();
  return id ? receiptById[id] : undefined;
};

/**
 * Hook to get multiple receipts by IDs with O(n) where n is the number of IDs
 */
export const useReceiptsByIds = (ids: string[]): Receipt[] => {
  const { receiptById } = useReceiptData();
  return useMemo(() => {
    return ids
      .map((id) => receiptById[id])
      .filter(Boolean) as Receipt[];
  }, [ids, receiptById]);
};

/**
 * Hook to filter receipts by a predicate
 */
export const useFilteredReceipts = (
  predicate: (receipt: Receipt) => boolean
): Receipt[] => {
  const { receipts } = useReceiptData();
  return useMemo(() => {
    return receipts.filter(predicate);
  }, [receipts, predicate]);
};

/**
 * Hook to get receipts by merchant with O(n) complexity
 */
export const useReceiptsByMerchant = (merchant: string): Receipt[] => {
  const { receipts } = useReceiptData();
  return useMemo(() => {
    return receipts.filter((receipt) => 
      receipt.merchant.toLowerCase() === merchant.toLowerCase()
    );
  }, [receipts, merchant]);
};

/**
 * Hook to get receipts within a date range
 */
export const useReceiptsByDateRange = (
  startDate: string,
  endDate: string
): Receipt[] => {
  const { receipts } = useReceiptData();
  return useMemo(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return receipts.filter((receipt) => {
      const receiptDate = new Date(receipt.date).getTime();
      return receiptDate >= start && receiptDate <= end;
    });
  }, [receipts, startDate, endDate]);
};

/**
 * Hook to get unsynced receipts
 */
export const useUnsyncedReceipts = (): Receipt[] => {
  const { receipts } = useReceiptData();
  return useMemo(() => {
    return receipts.filter((receipt) => !receipt.isSynced);
  }, [receipts]);
};

/**
 * Hook to get receipt count
 */
export const useReceiptCount = (): number => {
  const { receiptIds } = useReceiptData();
  return receiptIds.length;
};

/**
 * Hook to check if a receipt exists
 */
export const useReceiptExists = (id: string): boolean => {
  const { receiptById } = useReceiptData();
  return id in receiptById;
};

/**
 * Hook for batch operations on receipts
 */
export const useBatchReceiptOperations = () => {
  const { updateReceipt, deleteReceipt } = useReceiptActions();
  
  const batchUpdate = useCallback(
    async (updates: Array<{ id: string; data: Partial<Receipt> }>) => {
      const promises = updates.map(({ id, data }) => updateReceipt(id, data));
      await Promise.all(promises);
    },
    [updateReceipt]
  );
  
  const batchDelete = useCallback(
    async (ids: string[]) => {
      const promises = ids.map((id) => deleteReceipt(id));
      await Promise.all(promises);
    },
    [deleteReceipt]
  );
  
  return { batchUpdate, batchDelete };
};

/**
 * Hook to get receipts sorted by a specific field
 */
export const useSortedReceipts = (
  sortBy: keyof Receipt,
  order: 'asc' | 'desc' = 'desc'
): Receipt[] => {
  const { receipts } = useReceiptData();
  
  return useMemo(() => {
    const sorted = [...receipts].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return order === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return order === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      // For dates
      const aTime = new Date(aValue as string).getTime();
      const bTime = new Date(bValue as string).getTime();
      return order === 'asc' ? aTime - bTime : bTime - aTime;
    });
    
    return sorted;
  }, [receipts, sortBy, order]);
};

/**
 * Hook to get receipts grouped by a field
 */
export const useGroupedReceipts = <K extends keyof Receipt>(
  groupBy: K
): Record<string, Receipt[]> => {
  const { receipts } = useReceiptData();
  
  return useMemo(() => {
    return receipts.reduce((groups, receipt) => {
      const key = String(receipt[groupBy]);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(receipt);
      return groups;
    }, {} as Record<string, Receipt[]>);
  }, [receipts, groupBy]);
};

/**
 * Hook for receipt statistics
 */
export const useReceiptStats = () => {
  const { receipts } = useReceiptData();
  
  return useMemo(() => {
    const total = receipts.reduce((sum, receipt) => sum + receipt.amount, 0);
    const average = receipts.length > 0 ? total / receipts.length : 0;
    const synced = receipts.filter((r) => r.isSynced).length;
    const unsynced = receipts.length - synced;
    
    const byCategory = receipts.reduce((acc, receipt) => {
      const category = receipt.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, total: 0 };
      }
      acc[category].count++;
      acc[category].total += receipt.amount;
      return acc;
    }, {} as Record<string, { count: number; total: number }>);
    
    return {
      count: receipts.length,
      totalAmount: total,
      averageAmount: average,
      syncedCount: synced,
      unsyncedCount: unsynced,
      byCategory,
    };
  }, [receipts]);
};