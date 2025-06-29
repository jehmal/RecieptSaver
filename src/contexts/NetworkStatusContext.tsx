import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NetworkStatus } from '../types/sync';

interface NetworkStatusContextType {
  networkStatus: NetworkStatus;
  isOnline: boolean;
  isSyncing: boolean;
  syncProgress: number;
  pendingSyncCount: number;
  lastSyncTime: Date | null;
  triggerSync: () => Promise<void>;
  retryFailedSyncs: () => Promise<void>;
}

const NetworkStatusContext = createContext<NetworkStatusContextType | undefined>(undefined);

interface NetworkStatusProviderProps {
  children: ReactNode;
  onNetworkChange?: (status: NetworkStatus) => void;
  syncInterval?: number; // in milliseconds
}

export const NetworkStatusProvider: React.FC<NetworkStatusProviderProps> = ({ 
  children, 
  onNetworkChange,
  syncInterval = 30000 // 30 seconds default
}) => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Convert NetInfoState to NetworkStatus
  const convertNetInfoState = (state: NetInfoState): NetworkStatus => {
    const networkStatus: NetworkStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable,
      type: state.type as NetworkStatus['type'],
    };

    if (state.details) {
      networkStatus.details = {
        isConnectionExpensive: (state.details as any).isConnectionExpensive,
        cellularGeneration: (state.details as any).cellularGeneration,
      };
    }

    return networkStatus;
  };

  // Monitor network status
  useEffect(() => {
    const subscribe = () => {
      unsubscribeRef.current = NetInfo.addEventListener(state => {
        const status = convertNetInfoState(state);
        setNetworkStatus(status);
        onNetworkChange?.(status);

        // Trigger sync when coming back online
        if (status.isConnected && !networkStatus.isConnected) {
          triggerSync();
        }
      });
    };

    subscribe();

    // Fetch initial state
    NetInfo.fetch().then(state => {
      setNetworkStatus(convertNetInfoState(state));
    });

    return () => {
      unsubscribeRef.current?.();
    };
  }, []);

  // Auto-sync interval
  useEffect(() => {
    if (networkStatus.isConnected && syncInterval > 0) {
      syncIntervalRef.current = setInterval(() => {
        triggerSync();
      }, syncInterval);
    } else {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [networkStatus.isConnected, syncInterval]);

  const triggerSync = async () => {
    if (!networkStatus.isConnected || isSyncing) {
      return;
    }

    setIsSyncing(true);
    setSyncProgress(0);

    try {
      // TODO: Implement actual sync logic here
      // This is a mock implementation
      const totalItems = pendingSyncCount || 1;
      
      for (let i = 0; i < totalItems; i++) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        setSyncProgress(((i + 1) / totalItems) * 100);
      }

      setPendingSyncCount(0);
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Sync failed:', error);
      // Keep items in pending state
    } finally {
      setIsSyncing(false);
      setSyncProgress(0);
    }
  };

  const retryFailedSyncs = async () => {
    // TODO: Implement retry logic for failed syncs
    await triggerSync();
  };

  const isOnline = networkStatus.isConnected && (networkStatus.isInternetReachable ?? true);

  return (
    <NetworkStatusContext.Provider 
      value={{ 
        networkStatus,
        isOnline,
        isSyncing,
        syncProgress,
        pendingSyncCount,
        lastSyncTime,
        triggerSync,
        retryFailedSyncs,
      }}
    >
      {children}
    </NetworkStatusContext.Provider>
  );
};

export const useNetworkStatus = () => {
  const context = useContext(NetworkStatusContext);
  if (context === undefined) {
    throw new Error('useNetworkStatus must be used within a NetworkStatusProvider');
  }
  return context;
};