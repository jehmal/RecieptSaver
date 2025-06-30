import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  TextInput,
  ScrollView,
  RefreshControl,
  Image,
  Animated,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import ReceiptCard from '../components/gallery/ReceiptCard';
import { Receipt, useReceipts } from '../contexts/ReceiptContext';
import { mockReceipts, mockApi } from '../utils/mockData';
import { PinchGridView, GestureHints } from '../components/gestures';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ReceiptCardSkeleton, EmptyState, ActivityLoader } from '../components/loading';

// Get device dimensions
const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;
const isDesktop = screenWidth > 1024;

// Calculate grid columns based on device type
const getColumns = () => {
  if (isDesktop) return 6;
  if (isTablet) return screenWidth > 1000 ? 5 : 4;
  return 3;
};

// TypeScript interfaces

interface FilterChip {
  id: string;
  label: string;
  value: string;
  type: 'date' | 'amount' | 'category' | 'sync';
  isActive: boolean;
}

interface GalleryState {
  receipts: Receipt[];
  filteredReceipts: Receipt[];
  isLoading: boolean;
  isRefreshing: boolean;
  searchQuery: string;
  isSearchVisible: boolean;
  activeFilters: FilterChip[];
  selectedReceipts: string[];
  isMultiSelectMode: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  gridColumns: number;
}


const GalleryScreen: React.FC = () => {
  // Get receipts from context
  const { receipts: contextReceipts, addReceipt, isLoading: contextLoading } = useReceipts();
  const navigation = useNavigation<any>();
  
  // State management
  const [state, setState] = useState<GalleryState>({
    receipts: [],
    filteredReceipts: [],
    isLoading: true,
    isRefreshing: false,
    searchQuery: '',
    isSearchVisible: false,
    activeFilters: [
      { id: 'date-week', label: 'This Week', value: 'week', type: 'date', isActive: false },
      { id: 'date-month', label: 'This Month', value: 'month', type: 'date', isActive: false },
      { id: 'amount-low', label: '<$50', value: '0-50', type: 'amount', isActive: false },
      { id: 'amount-high', label: '>$100', value: '100+', type: 'amount', isActive: false },
      { id: 'sync-yes', label: 'Synced', value: 'true', type: 'sync', isActive: false },
      { id: 'sync-no', label: 'Not Synced', value: 'false', type: 'sync', isActive: false },
    ],
    selectedReceipts: [],
    isMultiSelectMode: false,
    loadingMore: false,
    hasMore: true,
    gridColumns: getColumns(),
  });

  // Refs
  const flatListRef = useRef<FlatList>(null);
  const searchInputRef = useRef<TextInput>(null);
  const searchAnimation = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(1)).current;

  // Load initial data and populate context if empty
  useEffect(() => {
    if (contextReceipts.length === 0 && !contextLoading) {
      // Initialize with mock data if context is empty
      mockApi.receipts.getAll().then(mockData => {
        mockData.forEach(receipt => {
          addReceipt(receipt);
        });
      });
    }
    
    setState(prev => ({
      ...prev,
      receipts: contextReceipts,
      isLoading: contextLoading,
    }));
  }, [contextReceipts, contextLoading]);

  // Filter receipts based on search and filters
  useEffect(() => {
    filterReceipts();
  }, [state.receipts, state.searchQuery, state.activeFilters]);

  // Load more receipts for infinite scroll
  const loadMoreReceipts = async () => {
    if (state.loadingMore || !state.hasMore) return;

    setState(prev => ({ ...prev, loadingMore: true }));

    // For demo purposes, just show loading indicator
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        loadingMore: false,
        hasMore: false, // No more data in mock
      }));
    }, 1000);
  };

  // Filter receipts
  const filterReceipts = () => {
    let filtered = [...state.receipts];

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(
        receipt =>
          receipt.merchant.toLowerCase().includes(query) ||
          receipt.amount.toString().includes(query) ||
          receipt.category?.toLowerCase().includes(query) ||
          receipt.date.includes(query)
      );
    }

    // Apply active filters
    state.activeFilters.forEach(filter => {
      if (!filter.isActive) return;

      switch (filter.type) {
        case 'date':
          const now = new Date();
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          filtered = filtered.filter(receipt => {
            const receiptDate = new Date(receipt.date);
            if (filter.value === 'week') return receiptDate >= weekAgo;
            if (filter.value === 'month') return receiptDate >= monthAgo;
            return true;
          });
          break;

        case 'amount':
          filtered = filtered.filter(receipt => {
            if (filter.value === '0-50') return receipt.amount < 50;
            if (filter.value === '100+') return receipt.amount >= 100;
            return true;
          });
          break;

        case 'sync':
          filtered = filtered.filter(receipt => 
            receipt.isSynced === (filter.value === 'true')
          );
          break;
      }
    });

    setState(prev => ({ ...prev, filteredReceipts: filtered }));
  };

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      // In a real app, this would sync with backend
      // For now, just update the state from context
      setState(prev => ({
        ...prev,
        receipts: contextReceipts,
        isRefreshing: false,
        selectedReceipts: [],
        isMultiSelectMode: false,
      }));
    } catch (error) {
      console.error('Error refreshing receipts:', error);
      setState(prev => ({ ...prev, isRefreshing: false }));
    }
  }, [contextReceipts]);

  // Toggle search visibility
  const toggleSearch = () => {
    const newVisibility = !state.isSearchVisible;
    setState(prev => ({ ...prev, isSearchVisible: newVisibility }));

    Animated.timing(searchAnimation, {
      toValue: newVisibility ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (newVisibility) {
      setTimeout(() => searchInputRef.current?.focus(), 300);
    } else {
      setState(prev => ({ ...prev, searchQuery: '' }));
    }
  };

  // Toggle filter
  const toggleFilter = (filterId: string) => {
    setState(prev => ({
      ...prev,
      activeFilters: prev.activeFilters.map(filter =>
        filter.id === filterId ? { ...filter, isActive: !filter.isActive } : filter
      ),
    }));
  };

  // Handle long press
  const handleLongPress = (receiptId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setState(prev => ({
      ...prev,
      isMultiSelectMode: true,
      selectedReceipts: [receiptId],
    }));
  };

  // Toggle receipt selection
  const toggleReceiptSelection = (receiptId: string) => {
    setState(prev => ({
      ...prev,
      selectedReceipts: prev.selectedReceipts.includes(receiptId)
        ? prev.selectedReceipts.filter(id => id !== receiptId)
        : [...prev.selectedReceipts, receiptId],
    }));
  };

  // Exit multi-select mode
  const exitMultiSelectMode = () => {
    setState(prev => ({
      ...prev,
      isMultiSelectMode: false,
      selectedReceipts: [],
    }));
  };

  // Delete selected receipts
  const deleteSelectedReceipts = () => {
    Alert.alert(
      'Delete Receipts',
      `Are you sure you want to delete ${state.selectedReceipts.length} receipt(s)?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setState(prev => ({
              ...prev,
              receipts: prev.receipts.filter(
                receipt => !prev.selectedReceipts.includes(receipt.id)
              ),
              selectedReceipts: [],
              isMultiSelectMode: false,
            }));
          },
        },
      ]
    );
  };

  // Navigate to camera
  const navigateToCamera = () => {
    // FAB animation
    Animated.sequence([
      Animated.timing(fabScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(fabScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    navigation.navigate('Camera');
  };

  // Navigate to receipt detail
  const navigateToReceiptDetail = (receipt: Receipt) => {
    if (state.isMultiSelectMode) {
      toggleReceiptSelection(receipt.id);
    } else {
      navigation.navigate('ReceiptDetailScreen', { receipt });
    }
  };

  // Render receipt card
  const renderReceiptCard = ({ item }: { item: Receipt }) => {
    const isSelected = state.selectedReceipts.includes(item.id);

    return (
      <ReceiptCard
        receipt={item}
        isSelected={isSelected}
        isMultiSelectMode={state.isMultiSelectMode}
        onPress={navigateToReceiptDetail}
        onLongPress={handleLongPress}
      />
    );
  };

  // Render filter chip
  const renderFilterChip = (filter: FilterChip) => (
    <TouchableOpacity
      key={filter.id}
      style={[styles.filterChip, filter.isActive && styles.filterChipActive]}
      onPress={() => toggleFilter(filter.id)}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, filter.isActive && styles.filterChipTextActive]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <EmptyState
      icon="receipt-outline"
      title="No receipts found"
      message={
        state.searchQuery || state.activeFilters.some(f => f.isActive)
          ? 'Try adjusting your search or filters'
          : 'Tap the camera button to add your first receipt'
      }
    />
  );

  // Render loading state
  if (state.isLoading) {
    return (
      <View style={styles.container}>
        <ActivityLoader 
          size="large" 
          message="Loading receipts..." 
          fullScreen 
        />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
        
        <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Receipt Gallery</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={toggleSearch}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={24} color="#1E293B" />
            </TouchableOpacity>
            {state.isMultiSelectMode && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={exitMultiSelectMode}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color="#1E293B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Search bar */}
        <Animated.View
          style={[
            styles.searchContainer,
            {
              height: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 56],
              }),
              opacity: searchAnimation,
              marginBottom: searchAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 16],
              }),
            },
          ]}
        >
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#64748B" style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search receipts..."
              placeholderTextColor="#64748B"
              value={state.searchQuery}
              onChangeText={(text) => setState(prev => ({ ...prev, searchQuery: text }))}
              returnKeyType="search"
            />
            {state.searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setState(prev => ({ ...prev, searchQuery: '' }))}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {state.activeFilters.map(renderFilterChip)}
        </ScrollView>

        {/* Multi-select action bar */}
        {state.isMultiSelectMode && (
          <View style={styles.multiSelectBar}>
            <Text style={styles.multiSelectText}>
              {state.selectedReceipts.length} selected
            </Text>
            <View style={styles.multiSelectActions}>
              <TouchableOpacity
                style={styles.multiSelectButton}
                onPress={() => {
                  setState(prev => ({
                    ...prev,
                    selectedReceipts: prev.selectedReceipts.length === prev.filteredReceipts.length
                      ? []
                      : prev.filteredReceipts.map(r => r.id),
                  }));
                }}
              >
                <Ionicons name="checkbox" size={20} color="#2563EB" />
                <Text style={styles.multiSelectButtonText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.multiSelectButton}
                onPress={deleteSelectedReceipts}
              >
                <Ionicons name="trash" size={20} color="#EF4444" />
                <Text style={[styles.multiSelectButtonText, { color: '#EF4444' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Receipt grid */}
        <PinchGridView
          minColumns={isTablet ? 3 : 2}
          maxColumns={isTablet ? 6 : 4}
          defaultColumns={state.gridColumns}
          onColumnsChange={(columns) => {
            setState(prev => ({ ...prev, gridColumns: columns }));
          }}
          enabled={!state.isMultiSelectMode}
        >
          {(columns) => (
            <FlatList
              ref={flatListRef}
              data={state.filteredReceipts}
              renderItem={renderReceiptCard}
              keyExtractor={item => item.id}
              numColumns={columns}
              key={columns} // Force re-render when columns change
              columnWrapperStyle={columns > 1 ? styles.row : undefined}
              contentContainerStyle={[
                styles.gridContent,
                state.filteredReceipts.length === 0 && styles.emptyContent,
              ]}
              refreshControl={
                <RefreshControl
                  refreshing={state.isRefreshing}
                  onRefresh={onRefresh}
                  colors={['#2563EB']}
                  tintColor="#2563EB"
                />
              }
              onEndReached={loadMoreReceipts}
              onEndReachedThreshold={0.5}
              ListEmptyComponent={renderEmptyState}
              ListFooterComponent={
                state.loadingMore ? (
                  <View style={styles.loadingMore}>
                    <ActivityIndicator size="small" color="#2563EB" />
                  </View>
                ) : null
              }
            />
          )}
        </PinchGridView>

        {/* Floating Action Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={navigateToCamera}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.fabInner,
              {
                transform: [{ scale: fabScale }],
              },
            ]}
          >
            <Ionicons name="camera" size={28} color="white" />
          </Animated.View>
        </TouchableOpacity>
        
        {/* Gesture Hints */}
        <GestureHints screen="gallery" />
      </SafeAreaView>
    </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: '#1E293B',
  },
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    maxHeight: 48,
    marginBottom: 8,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterChipText: {
    fontSize: 14,
    color: '#64748B',
  },
  filterChipTextActive: {
    color: 'white',
  },
  multiSelectBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#EFF6FF',
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  multiSelectText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  multiSelectActions: {
    flexDirection: 'row',
    gap: 16,
  },
  multiSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  multiSelectButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563EB',
  },
  gridContent: {
    paddingHorizontal: isTablet ? 16 : 4,
    paddingBottom: 100,
  },
  emptyContent: {
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GalleryScreen;