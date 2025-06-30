import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Extended Receipt type with optional fields
export interface Receipt {
  id: string;
  imageUri: string;
  thumbnailUri?: string;
  merchant: string;
  amount: number;
  date: string;
  category?: string;
  notes?: string;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional fields for enhanced functionality
  tags?: string[];
  paymentMethod?: string;
  merchantLogo?: string;
  merchantColor?: string;
}

// Normalized state structure for O(1) lookups
interface NormalizedReceiptState {
  byId: Record<string, Receipt>;  // { [id]: Receipt }
  allIds: string[];               // Ordered array of IDs
}

interface ReceiptContextType {
  receipts: Receipt[];  // Computed from normalized state for compatibility
  receiptById: Record<string, Receipt>;  // Direct access to byId map
  receiptIds: string[];  // Direct access to allIds
  addReceipt: (receipt: Receipt) => Promise<void>;
  updateReceipt: (id: string, updatedReceipt: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  getReceipt: (id: string) => Receipt | undefined;
  syncReceipts: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = '@infinite_receipts_normalized';

// Split contexts for optimized re-renders
const ReceiptDataContext = createContext<{ 
  receipts: Receipt[]; 
  receiptById: Record<string, Receipt>;
  receiptIds: string[];
  isLoading: boolean; 
  error: string | null 
} | undefined>(undefined);

const ReceiptActionsContext = createContext<Omit<ReceiptContextType, 'receipts' | 'receiptById' | 'receiptIds' | 'isLoading' | 'error'> | undefined>(undefined);

// Hook for receipt data (re-renders when receipts change)
export const useReceiptData = () => {
  const context = useContext(ReceiptDataContext);
  if (!context) {
    throw new Error('useReceiptData must be used within a ReceiptProvider');
  }
  return context;
};

// Hook for receipt actions (stable references, no re-renders)
export const useReceiptActions = () => {
  const context = useContext(ReceiptActionsContext);
  if (!context) {
    throw new Error('useReceiptActions must be used within a ReceiptProvider');
  }
  return context;
};

// Legacy hook for compatibility
export const useReceipts = () => {
  const data = useReceiptData();
  const actions = useReceiptActions();
  return { ...data, ...actions };
};

interface ReceiptProviderProps {
  children: React.ReactNode;
}

export const NormalizedReceiptProvider: React.FC<ReceiptProviderProps> = ({ children }) => {
  const [normalizedState, setNormalizedState] = useState<NormalizedReceiptState>({
    byId: {},
    allIds: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load receipts from storage on mount
  useEffect(() => {
    loadReceipts();
  }, []);

  // Save receipts to storage whenever they change
  useEffect(() => {
    if (!isLoading) {
      saveReceipts();
    }
  }, [normalizedState, isLoading]);

  const loadReceipts = async () => {
    try {
      setIsLoading(true);
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Check if data is already normalized
        if (parsedData.byId && parsedData.allIds) {
          setNormalizedState(parsedData);
        } else if (Array.isArray(parsedData)) {
          // Migrate from array format to normalized format
          const byId: Record<string, Receipt> = {};
          const allIds: string[] = [];
          
          parsedData.forEach((receipt: Receipt) => {
            byId[receipt.id] = receipt;
            allIds.push(receipt.id);
          });
          
          setNormalizedState({ byId, allIds });
        }
      }
    } catch (err) {
      setError('Failed to load receipts');
      console.error('Error loading receipts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReceipts = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
    } catch (err) {
      setError('Failed to save receipts');
      console.error('Error saving receipts:', err);
    }
  };

  // O(1) operations using normalized state
  const addReceipt = useCallback(async (receipt: Receipt) => {
    try {
      setNormalizedState((prev) => ({
        byId: {
          ...prev.byId,
          [receipt.id]: receipt,
        },
        allIds: [...prev.allIds, receipt.id],
      }));
      setError(null);
    } catch (err) {
      setError('Failed to add receipt');
      throw err;
    }
  }, []);

  const updateReceipt = useCallback(async (id: string, updatedData: Partial<Receipt>) => {
    try {
      console.log('NormalizedReceiptContext: Updating receipt', id, updatedData);
      
      setNormalizedState((prev) => {
        if (!prev.byId[id]) {
          console.warn(`Receipt with id ${id} not found`);
          return prev;
        }
        
        return {
          ...prev,
          byId: {
            ...prev.byId,
            [id]: {
              ...prev.byId[id],
              ...updatedData,
              updatedAt: new Date().toISOString(),
            },
          },
        };
      });
      setError(null);
    } catch (err) {
      setError('Failed to update receipt');
      throw err;
    }
  }, []);

  const deleteReceipt = useCallback(async (id: string) => {
    try {
      setNormalizedState((prev) => {
        const { [id]: deleted, ...remainingById } = prev.byId;
        return {
          byId: remainingById,
          allIds: prev.allIds.filter((receiptId) => receiptId !== id),
        };
      });
      setError(null);
    } catch (err) {
      setError('Failed to delete receipt');
      throw err;
    }
  }, []);

  // O(1) lookup
  const getReceipt = useCallback(
    (id: string) => {
      return normalizedState.byId[id];
    },
    [normalizedState.byId]
  );

  const syncReceipts = useCallback(async () => {
    try {
      setIsLoading(true);
      // In a real app, this would sync with a backend
      // For now, just mark all receipts as synced
      setNormalizedState((prev) => {
        const updatedById = { ...prev.byId };
        prev.allIds.forEach((id) => {
          updatedById[id] = {
            ...updatedById[id],
            isSynced: true,
          };
        });
        
        return {
          ...prev,
          byId: updatedById,
        };
      });
      setError(null);
    } catch (err) {
      setError('Failed to sync receipts');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Compute receipts array from normalized state for backward compatibility
  const receipts = useMemo(() => {
    return normalizedState.allIds.map((id) => normalizedState.byId[id]);
  }, [normalizedState]);

  // Memoize data context value
  const dataValue = useMemo(() => ({
    receipts,
    receiptById: normalizedState.byId,
    receiptIds: normalizedState.allIds,
    isLoading,
    error,
  }), [receipts, normalizedState.byId, normalizedState.allIds, isLoading, error]);

  // Memoize actions context value (stable references)
  const actionsValue = useMemo(() => ({
    addReceipt,
    updateReceipt,
    deleteReceipt,
    getReceipt,
    syncReceipts,
  }), [addReceipt, updateReceipt, deleteReceipt, getReceipt, syncReceipts]);

  return (
    <ReceiptDataContext.Provider value={dataValue}>
      <ReceiptActionsContext.Provider value={actionsValue}>
        {children}
      </ReceiptActionsContext.Provider>
    </ReceiptDataContext.Provider>
  );
};

// Convenience exports for migration
export const ReceiptProvider = NormalizedReceiptProvider;
export const OptimizedReceiptProvider = NormalizedReceiptProvider;