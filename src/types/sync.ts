export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

export interface SyncState {
  status: SyncStatus;
  progress?: number; // 0-100
  error?: string;
  lastSyncedAt?: Date;
  itemsToSync?: number;
  itemsSynced?: number;
}

export interface ReceiptSyncState extends SyncState {
  receiptId: string;
  retryCount?: number;
  priority?: 'high' | 'normal' | 'low';
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: 'unknown' | 'none' | 'wifi' | 'cellular' | 'other';
  details?: {
    isConnectionExpensive?: boolean;
    cellularGeneration?: '2g' | '3g' | '4g' | '5g' | null;
  };
}

export interface SyncQueueItem {
  id: string;
  type: 'receipt' | 'update' | 'delete';
  data: any;
  timestamp: Date;
  retries: number;
  priority: 'high' | 'normal' | 'low';
  status: 'pending' | 'processing' | 'failed';
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  startTime?: Date;
  estimatedTimeRemaining?: number; // in seconds
}

export interface SyncEvent {
  type: 'started' | 'progress' | 'completed' | 'failed' | 'retry';
  timestamp: Date;
  data?: any;
  error?: Error;
}