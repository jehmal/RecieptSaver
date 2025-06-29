import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

interface ReceiptContextType {
  receipts: Receipt[];
  addReceipt: (receipt: Receipt) => Promise<void>;
  updateReceipt: (id: string, updatedReceipt: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  getReceipt: (id: string) => Receipt | undefined;
  syncReceipts: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = '@infinite_receipts';

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined);

export const useReceipts = () => {
  const context = useContext(ReceiptContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptProvider');
  }
  return context;
};

interface ReceiptProviderProps {
  children: React.ReactNode;
}

export const ReceiptProvider: React.FC<ReceiptProviderProps> = ({ children }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
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
  }, [receipts, isLoading]);

  const loadReceipts = async () => {
    try {
      setIsLoading(true);
      const storedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedData) {
        const parsedReceipts = JSON.parse(storedData);
        setReceipts(parsedReceipts);
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
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
    } catch (err) {
      setError('Failed to save receipts');
      console.error('Error saving receipts:', err);
    }
  };

  const addReceipt = useCallback(async (receipt: Receipt) => {
    try {
      setReceipts((prev) => [...prev, receipt]);
      setError(null);
    } catch (err) {
      setError('Failed to add receipt');
      throw err;
    }
  }, []);

  const updateReceipt = useCallback(async (id: string, updatedData: Partial<Receipt>) => {
    try {
      console.log('ReceiptContext: Updating receipt', id, updatedData);
      
      setReceipts((prev) => {
        const updated = prev.map((receipt) =>
          receipt.id === id
            ? {
                ...receipt,
                ...updatedData,
                updatedAt: new Date().toISOString(),
              }
            : receipt
        );
        console.log('ReceiptContext: Updated receipts array', updated);
        return updated;
      });
      setError(null);
    } catch (err) {
      setError('Failed to update receipt');
      throw err;
    }
  }, []);

  const deleteReceipt = useCallback(async (id: string) => {
    try {
      setReceipts((prev) => prev.filter((receipt) => receipt.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete receipt');
      throw err;
    }
  }, []);

  const getReceipt = useCallback(
    (id: string) => {
      return receipts.find((receipt) => receipt.id === id);
    },
    [receipts]
  );

  const syncReceipts = useCallback(async () => {
    try {
      setIsLoading(true);
      // In a real app, this would sync with a backend
      // For now, just mark all receipts as synced
      setReceipts((prev) =>
        prev.map((receipt) => ({
          ...receipt,
          isSynced: true,
        }))
      );
      setError(null);
    } catch (err) {
      setError('Failed to sync receipts');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: ReceiptContextType = {
    receipts,
    addReceipt,
    updateReceipt,
    deleteReceipt,
    getReceipt,
    syncReceipts,
    isLoading,
    error,
  };

  return <ReceiptContext.Provider value={value}>{children}</ReceiptContext.Provider>;
};