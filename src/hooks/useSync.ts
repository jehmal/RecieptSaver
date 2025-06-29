import { useEffect, useState, useCallback } from 'react';
import { useSync as useSyncContext } from '../contexts/SyncContext';
import { useNetworkStatus } from '../contexts/NetworkStatusContext';
import { SyncStatus } from '../types/sync';

export interface UseSyncOptions {
  autoSync?: boolean;
  syncOnFocus?: boolean;
  retryOnError?: boolean;
  maxRetries?: number;
}

export const useSyncStatus = (receiptId?: string) => {
  const { getReceiptSyncState, globalSyncState } = useSyncContext();
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [progress, setProgress] = useState<number | undefined>();

  useEffect(() => {
    if (receiptId) {
      const state = getReceiptSyncState(receiptId);
      setStatus(state?.status || 'synced');
      setProgress(state?.progress);
    } else {
      setStatus(globalSyncState.status);
      setProgress(globalSyncState.progress);
    }
  }, [receiptId, getReceiptSyncState, globalSyncState]);

  return { status, progress };
};

export const useSyncActions = () => {
  const { addToSyncQueue, clearSyncErrors, retryFailedSyncs } = useSyncContext();
  const { triggerSync, isOnline } = useNetworkStatus();

  const syncReceipt = useCallback(async (receiptData: any) => {
    if (!isOnline) {
      // Queue for later
      addToSyncQueue({
        type: 'receipt',
        data: receiptData,
        priority: 'normal',
      });
      return { success: false, queued: true };
    }

    try {
      await triggerSync();
      return { success: true, queued: false };
    } catch (error) {
      addToSyncQueue({
        type: 'receipt',
        data: receiptData,
        priority: 'high',
      });
      return { success: false, queued: true, error };
    }
  }, [isOnline, addToSyncQueue, triggerSync]);

  const syncAll = useCallback(async () => {
    if (!isOnline) {
      return { success: false, message: 'No internet connection' };
    }

    try {
      await triggerSync();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }, [isOnline, triggerSync]);

  return {
    syncReceipt,
    syncAll,
    clearSyncErrors,
    retryFailedSyncs,
  };
};

export const useSyncMonitor = (callback: (event: any) => void) => {
  const { onSyncEvent } = useSyncContext();

  useEffect(() => {
    const unsubscribe = onSyncEvent(callback);
    return unsubscribe;
  }, [callback, onSyncEvent]);
};

export const useOfflineCapability = () => {
  const { isOnline, networkStatus } = useNetworkStatus();
  const { syncQueue, pendingSyncCount } = useNetworkStatus();
  const [offlineItemsCount, setOfflineItemsCount] = useState(0);

  useEffect(() => {
    setOfflineItemsCount(pendingSyncCount);
  }, [pendingSyncCount]);

  return {
    isOffline: !isOnline,
    networkType: networkStatus.type,
    hasOfflineItems: offlineItemsCount > 0,
    offlineItemsCount,
  };
};