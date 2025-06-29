import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSync } from '../contexts/SyncContext';
import { useNetworkStatus } from '../contexts/NetworkStatusContext';
import { useSyncActions, useOfflineCapability } from '../hooks/useSync';
import ReceiptCard from '../components/gallery/ReceiptCard';
import { Receipt } from '../contexts/ReceiptContext';
import { ReceiptSyncBadge } from '../components/sync/ReceiptSyncBadge';
import { PullToRefreshSync } from '../components/sync/PullToRefreshSync';
import { SyncProgressModal } from '../components/sync/SyncProgressModal';
import { mockReceipts } from '../utils/mockData';

const { width: screenWidth } = Dimensions.get('window');
const getColumns = () => {
  if (screenWidth > 1024) return 6;
  if (screenWidth > 768) return 4;
  return 3;
};

export const GalleryScreenWithSync: React.FC = () => {
  const { theme } = useTheme();
  const { syncQueue, globalSyncState } = useSync();
  const { isOnline } = useNetworkStatus();
  const { syncAll, syncReceipt } = useSyncActions();
  const { hasOfflineItems, offlineItemsCount } = useOfflineCapability();
  
  const [receipts, setReceipts] = useState<Receipt[]>(mockReceipts);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReceipts, setSelectedReceipts] = useState<string[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Simulate fetching latest receipts
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In real app, fetch from API
      // const updatedReceipts = await api.getReceipts();
      // setReceipts(updatedReceipts);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleSyncSelected = useCallback(async () => {
    if (selectedReceipts.length === 0) {
      Alert.alert('No Selection', 'Please select receipts to sync');
      return;
    }

    setShowSyncModal(true);
    
    for (const receiptId of selectedReceipts) {
      const receipt = receipts.find(r => r.id === receiptId);
      if (receipt) {
        await syncReceipt(receipt);
      }
    }
    
    setSelectedReceipts([]);
  }, [selectedReceipts, receipts, syncReceipt]);

  const toggleSelection = useCallback((receiptId: string) => {
    setSelectedReceipts(prev => 
      prev.includes(receiptId)
        ? prev.filter(id => id !== receiptId)
        : [...prev, receiptId]
    );
  }, []);

  const renderReceipt = ({ item }: { item: Receipt }) => (
    <View style={styles.receiptContainer}>
      <TouchableOpacity
        onPress={() => toggleSelection(item.id)}
        onLongPress={() => toggleSelection(item.id)}
      >
        <ReceiptCard receipt={item} />
        <ReceiptSyncBadge receiptId={item.id} position="top-right" />
        
        {selectedReceipts.includes(item.id) && (
          <View style={[styles.selectionOverlay, { backgroundColor: theme.colors.accent.primary + '30' }]}>
            <Ionicons name="checkmark-circle" size={32} color={theme.colors.accent.primary} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text.primary }]}>
        Gallery
      </Text>
      
      {hasOfflineItems && (
        <View style={[styles.offlineBadge, { backgroundColor: theme.colors.accent.warning }]}>
          <Ionicons name="cloud-offline" size={16} color="#FFFFFF" />
          <Text style={styles.offlineBadgeText}>{offlineItemsCount}</Text>
        </View>
      )}
      
      {selectedReceipts.length > 0 && (
        <TouchableOpacity
          style={[styles.syncButton, { backgroundColor: theme.colors.accent.primary }]}
          onPress={handleSyncSelected}
        >
          <Ionicons name="sync" size={20} color="#FFFFFF" />
          <Text style={styles.syncButtonText}>Sync ({selectedReceipts.length})</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <PullToRefreshSync
        scrollComponent="FlatList"
        onRefresh={handleRefresh}
        flatListProps={{
          data: receipts,
          renderItem: renderReceipt,
          keyExtractor: (item: Receipt) => item.id,
          numColumns: getColumns(),
          ListHeaderComponent: renderHeader,
          contentContainerStyle: styles.listContent,
          showsVerticalScrollIndicator: false,
        }}
      />
      
      <SyncProgressModal
        visible={showSyncModal}
        onClose={() => setShowSyncModal(false)}
        onCancel={() => {
          // Cancel sync logic
          setShowSyncModal(false);
        }}
        title="Syncing Selected Receipts"
      />
      
      {/* Floating action button for manual sync */}
      {syncQueue.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.accent.primary }]}
          onPress={() => setShowSyncModal(true)}
        >
          <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
          <View style={[styles.fabBadge, { backgroundColor: theme.colors.accent.error }]}>
            <Text style={styles.fabBadgeText}>{syncQueue.length}</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  offlineBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  receiptContainer: {
    flex: 1,
    padding: 8,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});