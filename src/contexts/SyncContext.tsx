import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SyncState, ReceiptSyncState, SyncQueueItem, SyncProgress, SyncEvent } from '../types/sync';
import { useNetworkStatus } from './NetworkStatusContext';

interface SyncContextType {
  globalSyncState: SyncState;
  receiptSyncStates: Map<string, ReceiptSyncState>;
  syncQueue: SyncQueueItem[];
  syncProgress: SyncProgress | null;
  addToSyncQueue: (item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries' | 'status'>) => void;
  removeFromSyncQueue: (id: string) => void;
  getReceiptSyncState: (receiptId: string) => ReceiptSyncState | undefined;
  updateReceiptSyncState: (receiptId: string, state: Partial<ReceiptSyncState>) => void;
  clearSyncErrors: () => void;
  onSyncEvent: (callback: (event: SyncEvent) => void) => () => void;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

const SYNC_QUEUE_KEY = '@sync_queue';
const RECEIPT_SYNC_STATES_KEY = '@receipt_sync_states';

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isOnline } = useNetworkStatus();
  const [globalSyncState, setGlobalSyncState] = useState<SyncState>({
    status: 'synced',
    lastSyncedAt: new Date(),
  });
  const [receiptSyncStates, setReceiptSyncStates] = useState<Map<string, ReceiptSyncState>>(new Map());
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncEventListeners, setSyncEventListeners] = useState<Array<(event: SyncEvent) => void>>([]);

  // Load persisted sync queue and states on mount
  useEffect(() => {
    loadPersistedData();
  }, []);

  // Persist sync queue changes
  useEffect(() => {
    AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(syncQueue));
  }, [syncQueue]);

  // Persist receipt sync states changes
  useEffect(() => {
    const statesArray = Array.from(receiptSyncStates.entries());
    AsyncStorage.setItem(RECEIPT_SYNC_STATES_KEY, JSON.stringify(statesArray));
  }, [receiptSyncStates]);

  const loadPersistedData = async () => {
    try {
      const [queueData, statesData] = await Promise.all([
        AsyncStorage.getItem(SYNC_QUEUE_KEY),
        AsyncStorage.getItem(RECEIPT_SYNC_STATES_KEY),
      ]);

      if (queueData) {
        setSyncQueue(JSON.parse(queueData));
      }

      if (statesData) {
        const statesArray = JSON.parse(statesData);
        setReceiptSyncStates(new Map(statesArray));
      }
    } catch (error) {
      console.error('Error loading persisted sync data:', error);
    }
  };

  const emitSyncEvent = (event: SyncEvent) => {
    syncEventListeners.forEach(listener => listener(event));
  };

  const addToSyncQueue = useCallback((item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries' | 'status'>) => {
    const newItem: SyncQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      retries: 0,
      status: 'pending',
    };

    setSyncQueue(prev => [...prev, newItem]);
    
    // Update global sync state
    setGlobalSyncState(prev => ({
      ...prev,
      status: 'pending',
      itemsToSync: (prev.itemsToSync || 0) + 1,
    }));

    emitSyncEvent({
      type: 'started',
      timestamp: new Date(),
      data: newItem,
    });

    // If online, trigger sync processing
    if (isOnline) {
      processSyncQueue();
    }
  }, [isOnline]);

  const removeFromSyncQueue = useCallback((id: string) => {
    setSyncQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateReceiptSyncState = useCallback((receiptId: string, state: Partial<ReceiptSyncState>) => {
    setReceiptSyncStates(prev => {
      const newStates = new Map(prev);
      const currentState = newStates.get(receiptId) || {
        receiptId,
        status: 'pending',
      };
      newStates.set(receiptId, { ...currentState, ...state });
      return newStates;
    });
  }, []);

  const getReceiptSyncState = useCallback((receiptId: string): ReceiptSyncState | undefined => {
    return receiptSyncStates.get(receiptId);
  }, [receiptSyncStates]);

  const clearSyncErrors = useCallback(() => {
    setReceiptSyncStates(prev => {
      const newStates = new Map(prev);
      newStates.forEach((state, key) => {
        if (state.status === 'error') {
          newStates.set(key, { ...state, status: 'pending', error: undefined });
        }
      });
      return newStates;
    });

    setSyncQueue(prev => prev.map(item => 
      item.status === 'failed' ? { ...item, status: 'pending', retries: 0 } : item
    ));
  }, []);

  const processSyncQueue = async () => {
    if (!isOnline || syncQueue.length === 0) return;

    const pendingItems = syncQueue.filter(item => item.status === 'pending');
    if (pendingItems.length === 0) return;

    setGlobalSyncState(prev => ({ ...prev, status: 'syncing' }));
    setSyncProgress({
      total: pendingItems.length,
      completed: 0,
      failed: 0,
      inProgress: 0,
      startTime: new Date(),
    });

    for (const item of pendingItems) {
      try {
        setSyncProgress(prev => prev ? { ...prev, inProgress: prev.inProgress + 1 } : null);
        
        // TODO: Implement actual sync logic based on item type
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        removeFromSyncQueue(item.id);
        setSyncProgress(prev => prev ? { 
          ...prev, 
          completed: prev.completed + 1,
          inProgress: prev.inProgress - 1,
        } : null);

        emitSyncEvent({
          type: 'completed',
          timestamp: new Date(),
          data: item,
        });
      } catch (error) {
        setSyncQueue(prev => prev.map(i => 
          i.id === item.id 
            ? { ...i, status: 'failed', retries: i.retries + 1 }
            : i
        ));
        
        setSyncProgress(prev => prev ? { 
          ...prev, 
          failed: prev.failed + 1,
          inProgress: prev.inProgress - 1,
        } : null);

        emitSyncEvent({
          type: 'failed',
          timestamp: new Date(),
          data: item,
          error: error as Error,
        });
      }
    }

    setGlobalSyncState(prev => ({
      ...prev,
      status: 'synced',
      lastSyncedAt: new Date(),
      itemsToSync: 0,
    }));
    setSyncProgress(null);
  };

  const onSyncEvent = useCallback((callback: (event: SyncEvent) => void) => {
    setSyncEventListeners(prev => [...prev, callback]);
    return () => {
      setSyncEventListeners(prev => prev.filter(listener => listener !== callback));
    };
  }, []);

  // Auto-process queue when coming online
  useEffect(() => {
    if (isOnline) {
      processSyncQueue();
    }
  }, [isOnline]);

  return (
    <SyncContext.Provider
      value={{
        globalSyncState,
        receiptSyncStates,
        syncQueue,
        syncProgress,
        addToSyncQueue,
        removeFromSyncQueue,
        getReceiptSyncState,
        updateReceiptSyncState,
        clearSyncErrors,
        onSyncEvent,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
};