# Sync Status UI Components

This directory contains all the sync status indicators and offline mode UI components for the receipt management app.

## Components Overview

### 1. NetworkStatusProvider & SyncProvider
The foundation contexts that manage network state and sync operations.

```tsx
// In your App.tsx
import { NetworkStatusProvider } from './contexts/NetworkStatusContext';
import { SyncProvider } from './contexts/SyncContext';

<NetworkStatusProvider syncInterval={60000}>
  <SyncProvider>
    {/* Your app */}
  </SyncProvider>
</NetworkStatusProvider>
```

### 2. SyncStatusBar
A global sync status bar that appears at the top of the screen when syncing or offline.

```tsx
import { SyncStatusBar } from './components/sync/SyncStatusBar';

// Add to your app root
<SyncStatusBar />
```

### 3. ReceiptSyncBadge
Individual receipt sync status indicator that overlays on receipt cards.

```tsx
import { ReceiptSyncBadge } from './components/sync/ReceiptSyncBadge';

<View>
  <ReceiptCard receipt={receipt} />
  <ReceiptSyncBadge 
    receiptId={receipt.id} 
    position="top-right"
    size="small"
  />
</View>
```

### 4. OfflineBanner
Persistent banner showing offline status and network information.

```tsx
import { OfflineBanner } from './components/sync/OfflineBanner';

<OfflineBanner 
  position="bottom"
  showNetworkType={true}
  onPress={() => navigateToSettings()}
/>
```

### 5. SyncProgressModal
Modal for showing bulk sync operations progress.

```tsx
import { SyncProgressModal } from './components/sync/SyncProgressModal';

<SyncProgressModal
  visible={showSyncModal}
  onClose={() => setShowSyncModal(false)}
  onCancel={() => cancelSync()}
  title="Syncing Receipts"
/>
```

### 6. PullToRefreshSync
Enhanced pull-to-refresh with sync integration.

```tsx
import { PullToRefreshSync } from './components/sync/PullToRefreshSync';

<PullToRefreshSync onRefresh={handleRefresh}>
  {/* Your scrollable content */}
</PullToRefreshSync>
```

### 7. SyncNotification
Toast-style notifications for sync events.

```tsx
import { SyncNotification } from './components/sync/SyncNotification';

<SyncNotification 
  position="top"
  duration={3000}
/>
```

## Hooks

### useSync
Main hook for sync operations and state.

```tsx
import { useSync } from '../contexts/SyncContext';

const { 
  globalSyncState,
  syncQueue,
  addToSyncQueue,
  getReceiptSyncState 
} = useSync();
```

### useSyncStatus
Get sync status for global or specific receipt.

```tsx
import { useSyncStatus } from '../hooks/useSync';

const { status, progress } = useSyncStatus(receiptId);
```

### useSyncActions
Perform sync actions like syncing receipts.

```tsx
import { useSyncActions } from '../hooks/useSync';

const { syncReceipt, syncAll, retryFailedSyncs } = useSyncActions();

// Sync a single receipt
const result = await syncReceipt(receiptData);

// Sync all pending items
await syncAll();
```

### useOfflineCapability
Monitor offline status and pending items.

```tsx
import { useOfflineCapability } from '../hooks/useSync';

const { 
  isOffline, 
  networkType, 
  hasOfflineItems, 
  offlineItemsCount 
} = useOfflineCapability();
```

## Integration Examples

### Gallery Screen with Sync
```tsx
<View style={styles.container}>
  <PullToRefreshSync onRefresh={handleRefresh}>
    <FlatList
      data={receipts}
      renderItem={({ item }) => (
        <View>
          <ReceiptCard receipt={item} />
          <ReceiptSyncBadge receiptId={item.id} />
        </View>
      )}
    />
  </PullToRefreshSync>
  
  <SyncProgressModal visible={showSync} onClose={() => setShowSync(false)} />
</View>
```

### Camera Screen with Auto-sync
```tsx
const { syncReceipt } = useSyncActions();

const handleCapture = async (photoUri) => {
  const receipt = await processReceipt(photoUri);
  const result = await syncReceipt(receipt);
  
  if (!result.success) {
    // Queued for later sync
    showOfflineNotification();
  }
};
```

## Sync States

The sync system supports the following states:

- **synced**: Item successfully synced with server
- **syncing**: Currently syncing
- **pending**: Waiting to sync (queued)
- **error**: Sync failed, will retry
- **offline**: No network connection

## Design Considerations

1. **Minimal UI Disruption**: Sync indicators are subtle and don't block user interaction
2. **Clear Visual States**: Each sync state has distinct visual representation
3. **Battery Efficient**: Network monitoring is optimized for battery life
4. **Accessibility**: All states are announced to screen readers
5. **Smooth Animations**: State transitions use smooth, non-jarring animations

## Customization

All components support theming through the ThemeContext. Colors automatically adapt to light/dark mode.

```tsx
const { theme } = useTheme();

// Components will use theme colors:
// - theme.colors.accent.primary (syncing)
// - theme.colors.accent.success (synced)
// - theme.colors.accent.warning (offline/pending)
// - theme.colors.accent.error (failed)
```