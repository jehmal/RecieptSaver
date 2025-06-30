import React, { useState, useMemo, Fragment, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  SectionList,
  StatusBar,
  ScrollView,
  FlatList,
  Animated,
  BackHandler,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ReceiptListItem from '../components/search/ReceiptListItem';
import SelectableReceiptListItem from '../components/search/SelectableReceiptListItem';
import { SearchBar } from '../components/search/SearchBar';
import { FilterPills } from '../components/search/FilterPills';
import { AdvancedFilterSheet } from '../components/search/AdvancedFilterSheet';
import SelectionModeHeader from '../components/search/SelectionModeHeader';
import FloatingActionBar from '../components/search/FloatingActionBar';
import BulkActionsMenu from '../components/search/BulkActionsMenu';
import CategorySelectionModal from '../components/search/CategorySelectionModal';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useReceipts } from '../contexts/ReceiptContext';
import BlackbirdTabSelector from '../components/home/BlackbirdTabSelector';
import { Warranty, sortWarrantiesByExpiry } from '../types/warranty';
import WarrantyCard from '../components/home/WarrantyCard';
import WarrantyListItem from '../components/search/WarrantyListItem';
import { FilterState, defaultFilterState } from '../types/filters';
import * as Haptics from 'expo-haptics';
import { SwipeableReceiptCard, PullToRefresh, GestureHints, SwipeableWrapper } from '../components/gestures';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { SearchResultsSkeleton, EmptyState, ReceiptListItemSkeleton, WarrantyListItemSkeleton } from '../components/loading';

// Types
interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Receipt {
  id: string;
  merchant: string;
  amount: number;
  date: Date;
  tags: Tag[];
  thumbnail?: string;
  category: string;
  paymentMethod: string;
  merchantLogo?: string;
  merchantColor?: string;
  description?: string;
}

interface ReceiptSection {
  title: string;
  data: Receipt[];
}

// Sample tags
const sampleTags: Tag[] = [
  { id: '1', name: 'Business', color: '#007AFF' },
  { id: '2', name: 'Personal', color: '#34C759' },
  { id: '3', name: 'Tax Deductible', color: '#AF52DE' },
  { id: '4', name: 'Reimbursable', color: '#FF9500' },
  { id: '5', name: 'Travel', color: '#FF3B30' },
  { id: '6', name: 'Food', color: '#FF9500' },
];

// Sample receipt data
const generateSampleReceipts = (): Receipt[] => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  // Helper to create dates relative to current date
  const getDate = (daysAgo: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date;
  };

  return [
    // Recent receipts (Last few days)
    {
      id: '1',
      merchant: 'Whole Foods Market',
      amount: 127.84,
      date: getDate(0),
      tags: [sampleTags[1], sampleTags[5]],
      category: 'Groceries',
      paymentMethod: 'Apple Pay',
      description: 'Grocery shopping',
      thumbnail: 'https://picsum.photos/seed/receipt1/200/300',
      merchantLogo: '🛒',
      merchantColor: '#00674B',
    },
    {
      id: '2',
      merchant: 'Starbucks',
      amount: 6.75,
      date: getDate(1),
      tags: [sampleTags[1], sampleTags[5]],
      category: 'Restaurants',
      paymentMethod: 'Starbucks Card',
      description: 'Venti Latte',
      thumbnail: 'https://picsum.photos/seed/receipt2/200/300',
      merchantLogo: '☕',
      merchantColor: '#00704A',
    },
    {
      id: '3',
      merchant: 'Shell',
      amount: 52.47,
      date: getDate(2),
      tags: [sampleTags[0], sampleTags[2]],
      category: 'Transportation',
      paymentMethod: 'Visa •••• 4532',
      description: 'Gas - Regular',
      thumbnail: 'https://picsum.photos/seed/receipt3/200/300',
      merchantLogo: '⛽',
      merchantColor: '#FCD307',
    },
    {
      id: '4',
      merchant: 'Target',
      amount: 89.23,
      date: getDate(3),
      tags: [sampleTags[1]],
      category: 'Shopping',
      paymentMethod: 'Target RedCard •••• 8901',
      description: 'Home essentials',
      thumbnail: 'https://picsum.photos/seed/receipt4/200/300',
      merchantLogo: '🎯',
      merchantColor: '#CC0000',
    },
    // Last week
    {
      id: '5',
      merchant: 'Uber',
      amount: 18.65,
      date: getDate(5),
      tags: [sampleTags[0], sampleTags[3]],
      category: 'Transportation',
      paymentMethod: 'Apple Pay',
      description: 'Ride to downtown',
      thumbnail: 'https://picsum.photos/seed/receipt5/200/300',
      merchantLogo: '🚗',
      merchantColor: '#000000',
    },
    {
      id: '6',
      merchant: 'Chipotle Mexican Grill',
      amount: 14.85,
      date: getDate(6),
      tags: [sampleTags[0], sampleTags[5]],
      category: 'Restaurants',
      paymentMethod: 'Mastercard •••• 2346',
      description: 'Lunch - Burrito bowl',
      thumbnail: 'https://picsum.photos/seed/receipt6/200/300',
      merchantLogo: '🌯',
      merchantColor: '#A81612',
    },
    {
      id: '7',
      merchant: 'Amazon',
      amount: 156.42,
      date: getDate(8),
      tags: [sampleTags[0], sampleTags[3]],
      category: 'Shopping',
      paymentMethod: 'Amazon Store Card •••• 5678',
      description: 'Office supplies',
      thumbnail: 'https://picsum.photos/seed/receipt7/200/300',
      merchantLogo: '📦',
      merchantColor: '#FF9900',
    },
    {
      id: '8',
      merchant: 'CVS Pharmacy',
      amount: 28.93,
      date: getDate(10),
      tags: [sampleTags[1]],
      category: 'Healthcare',
      paymentMethod: 'FSA Card •••• 3456',
      description: 'Prescriptions',
      thumbnail: 'https://picsum.photos/seed/receipt8/200/300',
      merchantLogo: '💊',
      merchantColor: '#CC0000',
    },
    // Earlier this month
    {
      id: '9',
      merchant: 'Best Buy',
      amount: 499.99,
      date: getDate(15),
      tags: [sampleTags[0], sampleTags[2], sampleTags[3]],
      category: 'Shopping',
      paymentMethod: 'Best Buy Card •••• 7890',
      description: 'iPad Pro',
      thumbnail: 'https://picsum.photos/seed/receipt9/200/300',
      merchantLogo: '💻',
      merchantColor: '#0046BE',
    },
    {
      id: '10',
      merchant: 'Trader Joe\'s',
      amount: 67.32,
      date: getDate(18),
      tags: [sampleTags[1], sampleTags[5]],
      category: 'Groceries',
      paymentMethod: 'Debit •••• 1234',
      description: 'Weekly groceries',
      thumbnail: 'https://picsum.photos/seed/receipt10/200/300',
      merchantLogo: '🌺',
      merchantColor: '#D01242',
    },
    {
      id: '11',
      merchant: 'Delta Air Lines',
      amount: 382.40,
      date: getDate(20),
      tags: [sampleTags[0], sampleTags[4], sampleTags[2]],
      category: 'Travel',
      paymentMethod: 'Amex •••• 0012',
      description: 'Flight LAX-JFK',
      thumbnail: 'https://picsum.photos/seed/receipt11/200/300',
      merchantLogo: '✈️',
      merchantColor: '#003366',
    },
    {
      id: '12',
      merchant: 'McDonald\'s',
      amount: 8.47,
      date: getDate(22),
      tags: [sampleTags[1], sampleTags[5]],
      category: 'Restaurants',
      paymentMethod: 'Cash',
      description: 'Breakfast',
      thumbnail: 'https://picsum.photos/seed/receipt12/200/300',
      merchantLogo: '🍟',
      merchantColor: '#FBC817',
    },
    // Last month
    {
      id: '13',
      merchant: 'Marriott Hotels',
      amount: 289.00,
      date: getDate(35),
      tags: [sampleTags[0], sampleTags[4], sampleTags[3]],
      category: 'Travel',
      paymentMethod: 'Marriott Bonvoy •••• 4567',
      description: 'Hotel stay - 2 nights',
      thumbnail: 'https://picsum.photos/seed/receipt13/200/300',
      merchantLogo: '🏨',
      merchantColor: '#9B1B30',
    },
    {
      id: '14',
      merchant: 'Walgreens',
      amount: 42.18,
      date: getDate(38),
      tags: [sampleTags[1]],
      category: 'Healthcare',
      paymentMethod: 'Visa •••• 8901',
      description: 'Pharmacy',
      thumbnail: 'https://picsum.photos/seed/receipt14/200/300',
      merchantLogo: '💊',
      merchantColor: '#E31837',
    },
    {
      id: '15',
      merchant: 'Chevron',
      amount: 48.65,
      date: getDate(40),
      tags: [sampleTags[1]],
      category: 'Transportation',
      paymentMethod: 'Mastercard •••• 3456',
      description: 'Gas - Premium',
      thumbnail: 'https://picsum.photos/seed/receipt15/200/300',
      merchantLogo: '⛽',
      merchantColor: '#0080C6',
    },
    {
      id: '16',
      merchant: 'AMC Theatres',
      amount: 36.00,
      date: getDate(42),
      tags: [sampleTags[1]],
      category: 'Entertainment',
      paymentMethod: 'AMC Stubs •••• 7890',
      description: 'Movie tickets x2',
      thumbnail: 'https://picsum.photos/seed/receipt16/200/300',
      merchantLogo: '🎬',
      merchantColor: '#ED1C24',
    },
    {
      id: '17',
      merchant: 'Spotify',
      amount: 9.99,
      date: getDate(45),
      tags: [sampleTags[1]],
      category: 'Entertainment',
      paymentMethod: 'PayPal',
      description: 'Monthly subscription',
      thumbnail: 'https://picsum.photos/seed/receipt17/200/300',
      merchantLogo: '🎵',
      merchantColor: '#1DB954',
    },
    {
      id: '18',
      merchant: 'Kroger',
      amount: 94.52,
      date: getDate(48),
      tags: [sampleTags[1], sampleTags[5]],
      category: 'Groceries',
      paymentMethod: 'Kroger Plus Card',
      description: 'Groceries',
      thumbnail: 'https://picsum.photos/seed/receipt18/200/300',
      merchantLogo: '🛒',
      merchantColor: '#1C539C',
    },
    // Two months ago
    {
      id: '19',
      merchant: 'United Airlines',
      amount: 524.30,
      date: getDate(65),
      tags: [sampleTags[0], sampleTags[4], sampleTags[2]],
      category: 'Travel',
      paymentMethod: 'United MileagePlus •••• 2345',
      description: 'Flight SFO-ORD',
      thumbnail: 'https://picsum.photos/seed/receipt19/200/300',
      merchantLogo: '✈️',
      merchantColor: '#005DAA',
    },
    {
      id: '20',
      merchant: 'Netflix',
      amount: 15.99,
      date: getDate(70),
      tags: [sampleTags[1]],
      category: 'Entertainment',
      paymentMethod: 'Visa •••• 6789',
      description: 'Monthly subscription',
      thumbnail: 'https://picsum.photos/seed/receipt20/200/300',
      merchantLogo: '🎥',
      merchantColor: '#E50914',
    },
    {
      id: '21',
      merchant: 'Whole Foods Market',
      amount: 156.78,
      date: getDate(75),
      tags: [sampleTags[0], sampleTags[5], sampleTags[3]],
      category: 'Groceries',
      paymentMethod: 'Amazon Prime Card •••• 3210',
      description: 'Weekly shopping',
      thumbnail: 'https://picsum.photos/seed/receipt21/200/300',
      merchantLogo: '🛒',
      merchantColor: '#00674B',
    },
    {
      id: '22',
      merchant: 'Starbucks',
      amount: 5.45,
      date: getDate(80),
      tags: [sampleTags[0]],
      category: 'Restaurants',
      paymentMethod: 'Starbucks Card',
      description: 'Grande Americano',
      thumbnail: 'https://picsum.photos/seed/receipt22/200/300',
      merchantLogo: '☕',
      merchantColor: '#00704A',
    },
  ];
};

interface SearchScreenProps {
  navigation: any; // Navigation prop
}

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(defaultFilterState);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { receipts: contextReceipts, addReceipt } = useReceipts();
  
  // Initialize with sample data if empty (for demo purposes)
  useEffect(() => {
    if (contextReceipts.length === 0) {
      const sampleReceipts = generateSampleReceipts();
      sampleReceipts.forEach(receipt => {
        addReceipt({
          id: receipt.id,
          merchant: receipt.merchant,
          amount: receipt.amount,
          date: receipt.date.toISOString(),
          category: receipt.category,
          imageUri: receipt.thumbnail || '',
          notes: receipt.description || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isSynced: false,
          tags: receipt.tags.map(tag => tag.name),
          paymentMethod: receipt.paymentMethod,
          merchantLogo: receipt.merchantLogo,
          merchantColor: receipt.merchantColor,
        });
      });
    }
  }, [contextReceipts.length, addReceipt]);
  
  // Convert context receipts to the local Receipt type format
  const receipts = useMemo(() => {
    console.log('SearchScreen: Converting context receipts, count:', contextReceipts.length);
    return contextReceipts.map(receipt => ({
      ...receipt,
      date: new Date(receipt.date),
      tags: receipt.tags?.map((tagName, index) => ({
        id: `tag-${index}`,
        name: typeof tagName === 'string' ? tagName : tagName.name,
        color: sampleTags.find(t => t.name === (typeof tagName === 'string' ? tagName : tagName.name))?.color || '#007AFF'
      })) || [],
      paymentMethod: receipt.paymentMethod || 'Cash',
      merchantLogo: receipt.merchantLogo || '🧾',
      merchantColor: receipt.merchantColor || '#007AFF',
      description: receipt.notes || '',
    }));
  }, [contextReceipts]);
  
  // Multi-select state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedReceiptIds, setSelectedReceiptIds] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  
  // Animation refs
  const selectionHeaderAnim = useRef(new Animated.Value(0)).current;
  
  // Mock warranty data
  const warranties: Warranty[] = [
    {
      id: 'w1',
      itemName: 'MacBook Pro 16"',
      serialNumber: 'C02XG2JUH7JG',
      purchaseDate: '2024-06-15',
      expiryDate: '2025-02-15',
      supplier: 'Apple Store',
      category: 'Electronics',
      createdAt: '2024-06-15',
      updatedAt: '2024-06-15',
    },
    {
      id: 'w2',
      itemName: 'Sony WH-1000XM5',
      serialNumber: 'SN123456789',
      purchaseDate: '2024-08-20',
      expiryDate: '2025-08-20',
      supplier: 'Best Buy',
      category: 'Electronics',
      createdAt: '2024-08-20',
      updatedAt: '2024-08-20',
    },
    {
      id: 'w3',
      itemName: 'Dyson V15 Detect',
      serialNumber: 'DYS987654321',
      purchaseDate: '2023-12-01',
      expiryDate: '2025-01-15',
      supplier: 'Dyson Direct',
      category: 'Home Appliances',
      createdAt: '2023-12-01',
      updatedAt: '2023-12-01',
    },
    {
      id: 'w4',
      itemName: 'Dell UltraSharp Monitor',
      serialNumber: 'DELL1234567',
      purchaseDate: '2023-01-01',
      expiryDate: '2024-01-01',
      supplier: 'Dell Direct',
      category: 'Electronics',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    },
    {
      id: 'w5',
      itemName: 'Samsung Galaxy S24',
      serialNumber: 'SAMS567890',
      purchaseDate: '2024-03-15',
      expiryDate: '2026-03-15',
      supplier: 'Samsung Store',
      category: 'Electronics',
      createdAt: '2024-03-15',
      updatedAt: '2024-03-15',
    },
    {
      id: 'w6',
      itemName: 'LG OLED TV 55"',
      serialNumber: 'LG55OLED2024',
      purchaseDate: '2024-11-01',
      expiryDate: '2026-11-01',
      supplier: 'Costco',
      category: 'Electronics',
      createdAt: '2024-11-01',
      updatedAt: '2024-11-01',
    },
    {
      id: 'w7',
      itemName: 'Instant Pot Pro',
      serialNumber: 'IP789012345',
      purchaseDate: '2023-09-10',
      expiryDate: '2024-09-10',
      supplier: 'Amazon',
      category: 'Home Appliances',
      createdAt: '2023-09-10',
      updatedAt: '2023-09-10',
    },
    {
      id: 'w8',
      itemName: 'Ninja Blender',
      serialNumber: 'NJ456789012',
      purchaseDate: '2024-05-20',
      expiryDate: '2025-05-20',
      supplier: 'Target',
      category: 'Home Appliances',
      createdAt: '2024-05-20',
      updatedAt: '2024-05-20',
    },
  ];
  
  const sortedWarranties = sortWarrantiesByExpiry(warranties);
  const { theme, themeMode } = useTheme();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'receipts' | 'warranties'>('receipts');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Filter warranties based on search query
  const filteredWarranties = useMemo(() => {
    if (!searchQuery || selectedTab !== 'warranties') {
      return sortedWarranties;
    }
    
    const query = searchQuery.toLowerCase();
    return sortedWarranties.filter(warranty => {
      const matchesItemName = warranty.itemName.toLowerCase().includes(query);
      const matchesSerialNumber = warranty.serialNumber.toLowerCase().includes(query);
      const matchesSupplier = warranty.supplier.toLowerCase().includes(query);
      const matchesCategory = warranty.category?.toLowerCase().includes(query) || false;
      
      return matchesItemName || matchesSerialNumber || matchesSupplier || matchesCategory;
    });
  }, [sortedWarranties, searchQuery, selectedTab]);
  
  // Calculate advanced filter count
  const advancedFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 10000) count++;
    if (filters.supplier) count++;
    if (filters.tags.length > 0) count++;
    if (filters.teamMember) count++;
    if (filters.gstStatus) count++;
    if (filters.warrantyStatus) count++;
    if (filters.receiptType) count++;
    if (filters.reimbursementStatus) count++;
    if (filters.jobSite) count++;
    if (filters.subscription) count++;
    return count;
  }, [filters]);

  // Filter receipts based on search query and all filters
  const filteredReceipts = useMemo(() => {
    console.log('SearchScreen: Filtering receipts, total count:', receipts.length);
    return receipts.filter(receipt => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesMerchant = receipt.merchant.toLowerCase().includes(query);
        const matchesAmount = receipt.amount.toString().includes(query);
        const matchesTags = receipt.tags.some(tag => 
          tag.name.toLowerCase().includes(query)
        );
        const matchesCategory = receipt.category.toLowerCase().includes(query);
        
        if (!matchesMerchant && !matchesAmount && !matchesTags && !matchesCategory) {
          return false;
        }
      }

      // Category filter
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(receipt.category)) {
          return false;
        }
      }

      // Date filter
      const now = new Date();
      const receiptDate = new Date(receipt.date);
      
      switch (filters.dateRange) {
        case 'Today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const receiptDay = new Date(receiptDate.getFullYear(), receiptDate.getMonth(), receiptDate.getDate());
          if (receiptDay.getTime() !== today.getTime()) return false;
          break;
        case 'This Week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          if (receiptDate < weekStart) return false;
          break;
        case 'This Month':
          if (receiptDate.getMonth() !== now.getMonth() || 
              receiptDate.getFullYear() !== now.getFullYear()) return false;
          break;
        case 'Custom':
          if (filters.customDateRange) {
            if (receiptDate < filters.customDateRange.start || 
                receiptDate > filters.customDateRange.end) {
              return false;
            }
          }
          break;
        case 'All Time':
          // No date filtering
          break;
      }

      // Price range filter
      if (receipt.amount < filters.priceRange.min || 
          receipt.amount > filters.priceRange.max) {
        return false;
      }

      // Supplier filter (using merchant as supplier for demo)
      if (filters.supplier && receipt.merchant !== filters.supplier) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(filterTag =>
          receipt.tags.some(tag => tag.name === filterTag)
        );
        if (!hasAllTags) return false;
      }

      // Additional filters would be implemented here based on receipt properties
      // For demo purposes, we're only implementing the main filters

      return true;
    });
  }, [receipts, searchQuery, filters]);
  
  // Handle back button in selection mode
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isSelectionMode) {
        exitSelectionMode();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, [isSelectionMode]);
  
  // Selection mode functions
  const enterSelectionMode = useCallback((receiptId?: string) => {
    console.log('Entering selection mode with receipt:', receiptId);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setIsSelectionMode(true);
    if (receiptId) {
      setSelectedReceiptIds(new Set([receiptId]));
    }
    // Animate header in
    Animated.timing(selectionHeaderAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const exitSelectionMode = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedReceiptIds(new Set());
    setShowBulkActions(false);
    // Animate header out
    Animated.timing(selectionHeaderAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const toggleReceiptSelection = useCallback((receiptId: string) => {
    setSelectedReceiptIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(receiptId)) {
        newSet.delete(receiptId);
      } else {
        newSet.add(receiptId);
      }
      return newSet;
    });
  }, []);
  
  const selectAllReceipts = useCallback(() => {
    const allIds = new Set(filteredReceipts.map(r => r.id));
    setSelectedReceiptIds(allIds);
  }, [filteredReceipts]);
  
  const deselectAllReceipts = useCallback(() => {
    setSelectedReceiptIds(new Set());
  }, []);
  
  // Bulk action handlers
  const handleBulkCategorize = useCallback(() => {
    setShowBulkActions(false);
    setShowCategoryModal(true);
  }, []);
  
  const handleBulkDelete = useCallback(() => {
    Alert.alert(
      'Delete Receipts',
      `Are you sure you want to delete ${selectedReceiptIds.size} receipt${selectedReceiptIds.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement actual deletion
            console.log('Deleting receipts:', Array.from(selectedReceiptIds));
            exitSelectionMode();
          },
        },
      ]
    );
  }, [selectedReceiptIds, exitSelectionMode]);
  
  const handleBulkExport = useCallback(() => {
    // TODO: Implement export functionality
    console.log('Exporting receipts:', Array.from(selectedReceiptIds));
    setShowBulkActions(false);
  }, [selectedReceiptIds]);
  
  const handleCategorySelect = useCallback((category: any) => {
    // TODO: Implement category assignment
    console.log('Assigning category:', category.name, 'to receipts:', Array.from(selectedReceiptIds));
    setShowCategoryModal(false);
    exitSelectionMode();
  }, [selectedReceiptIds, exitSelectionMode]);
  
  // Receipt interaction handlers
  const handleReceiptPress = useCallback((receipt: Receipt) => {
    if (isSelectionMode) {
      toggleReceiptSelection(receipt.id);
    } else {
      navigation.navigate('ReceiptDetailScreen', { receipt });
    }
  }, [isSelectionMode, toggleReceiptSelection, navigation]);
  
  const handleReceiptLongPress = useCallback((receipt: Receipt) => {
    console.log('Long press detected on receipt:', receipt.id, 'Selection mode:', isSelectionMode);
    if (!isSelectionMode) {
      enterSelectionMode(receipt.id);
    }
  }, [isSelectionMode, enterSelectionMode]);

  // Handle search with debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Show searching state for non-empty queries
    if (text.trim()) {
      setIsSearching(true);
      
      // Simulate search delay
      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(false);
      }, 500);
    } else {
      setIsSearching(false);
    }
  }, []);

  // Handle advanced filter apply
  const handleAdvancedFiltersApply = useCallback(() => {
    setShowAdvancedFilters(false);
  }, []);
  
  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you would refresh the data from the server
      Toast.show({
        type: 'success',
        text1: 'Refreshed',
        text2: selectedTab === 'receipts' ? 'Receipts updated successfully' : 'Warranties updated successfully',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Refresh Failed',
        text2: 'Please try again later',
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedTab]);


  // Calculate total for filtered receipts
  const filteredTotal = useMemo(() => {
    return filteredReceipts.reduce((sum, receipt) => sum + receipt.amount, 0);
  }, [filteredReceipts]);

  // Group filtered receipts by month
  const groupedReceipts = useMemo(() => {
    const groups: { [key: string]: Receipt[] } = {};
    
    filteredReceipts.forEach(receipt => {
      const date = new Date(receipt.date);
      const monthYear = date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(receipt);
    });

    // Convert to sections array and sort by date
    const sections: ReceiptSection[] = Object.entries(groups)
      .map(([title, data]) => ({
        title,
        data: data.sort((a, b) => b.date.getTime() - a.date.getTime()),
      }))
      .sort((a, b) => {
        const dateA = new Date(a.data[0].date);
        const dateB = new Date(b.data[0].date);
        return dateB.getTime() - dateA.getTime();
      });

    return sections;
  }, [filteredReceipts]);

  const renderReceiptItem = useCallback(({ item, index, section }: { item: Receipt; index: number; section: ReceiptSection }) => {
    const isLastItem = index === section.data.length - 1;
    
    // Handle receipt actions
    const handleCategorize = () => {
      setShowCategoryModal(true);
      setSelectedReceiptIds(new Set([item.id]));
    };
    
    const handleArchive = () => {
      Alert.alert(
        'Archive Receipt',
        `Archive receipt from ${item.merchant}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Archive', 
            style: 'destructive',
            onPress: () => {
              Toast.show({
                type: 'success',
                text1: 'Receipt Archived',
                text2: `${item.merchant} receipt has been archived`,
              });
            }
          }
        ]
      );
    };
    
    const handleDelete = () => {
      Alert.alert(
        'Delete Receipt',
        `Delete receipt from ${item.merchant}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              Toast.show({
                type: 'success',
                text1: 'Receipt Deleted',
                text2: `${item.merchant} receipt has been deleted`,
              });
            }
          }
        ]
      );
    };
    
    return (
      <Fragment key={item.id}>
        {isSelectionMode ? (
          <SelectableReceiptListItem
            receipt={item}
            isSelected={selectedReceiptIds.has(item.id)}
            isSelectionMode={isSelectionMode}
            onPress={() => handleReceiptPress(item)}
            onLongPress={() => handleReceiptLongPress(item)}
            onSelectionToggle={() => toggleReceiptSelection(item.id)}
          />
        ) : (
          <SwipeableWrapper>
            <SwipeableReceiptCard
            leftActions={[
              {
                type: 'categorize',
                color: '#007AFF',
                icon: 'pricetag',
                label: 'Category',
                onPress: handleCategorize,
              }
            ]}
            rightActions={[
              {
                type: 'archive',
                color: '#FF9500',
                icon: 'archive',
                label: 'Archive',
                onPress: handleArchive,
              },
              {
                type: 'delete',
                color: '#FF3B30',
                icon: 'trash',
                label: 'Delete',
                onPress: handleDelete,
              }
            ]}
            onLongPress={() => handleReceiptLongPress(item)}
            onDoubleTap={() => {
              navigation.navigate('ReceiptDetailScreen', { receipt: item });
            }}
            swipeEnabled={!isSelectionMode}
          >
            <ReceiptListItem 
              receipt={item} 
              onPress={() => handleReceiptPress(item)}
              onLongPress={() => handleReceiptLongPress(item)}
            />
            </SwipeableReceiptCard>
          </SwipeableWrapper>
        )}
        {!isLastItem && (
          <View style={[styles.separator, isSelectionMode && { marginLeft: 108 }]} />
        )}
      </Fragment>
    );
  }, [isSelectionMode, selectedReceiptIds, handleReceiptPress, handleReceiptLongPress, toggleReceiptSelection, navigation, theme.colors.card.border]);

  const renderSectionHeader = useCallback(({ section }: { section: ReceiptSection }) => {
    // Calculate total for this section
    const sectionTotal = section.data.reduce((sum, receipt) => sum + receipt.amount, 0);
    
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Text style={styles.sectionTotal}>${sectionTotal.toFixed(2)}</Text>
      </View>
    );
  }, []);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    headerSpacer: {
      width: 32,
    },
    summarySection: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: theme.colors.background,
    },
    greetingText: {
      fontSize: 18,
      fontWeight: '500',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    totalAmount: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    totalLabel: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.accent.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      gap: 4,
    },
    filterButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    listContent: {
      paddingBottom: 100,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 8,
      backgroundColor: theme.colors.background,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.tertiary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    sectionTotal: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.text.tertiary,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      textAlign: 'center',
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.card.border,
      marginLeft: 72,
      marginRight: 16,
    },
  }), [theme.colors, themeMode]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={themeMode === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      
      {/* Regular Header */}
      {!isSelectionMode && (
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Receipts & Warranties</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}
      
      {/* Selection Mode Header */}
      {isSelectionMode && (
        <SelectionModeHeader
          selectedCount={selectedReceiptIds.size}
          totalCount={filteredReceipts.length}
          onClose={exitSelectionMode}
          onSelectAll={selectAllReceipts}
          onDeselectAll={deselectAllReceipts}
          isAllSelected={selectedReceiptIds.size === filteredReceipts.length && filteredReceipts.length > 0}
          fadeAnim={selectionHeaderAnim}
        />
      )}

      {/* Summary Section with Toggle */}
      <View style={styles.summarySection}>
        <Text style={styles.greetingText}>Hi {user?.firstName || 'there'}, here are your:</Text>
      </View>
      
      {/* Tab Selector */}
      <BlackbirdTabSelector 
        selectedTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      {/* Search Bar - Hide in selection mode */}
      {!isSelectionMode && (
        <SearchBar 
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder={selectedTab === 'receipts' ? 'Search receipts, merchants, amounts...' : 'Search warranties, items, suppliers...'}
        />
      )}

      {/* Filter Pills - Only show for receipts and not in selection mode */}
      {selectedTab === 'receipts' && !isSelectionMode && (
        <FilterPills
          filters={filters}
          onFiltersChange={setFilters}
          onAdvancedPress={() => setShowAdvancedFilters(true)}
          advancedFilterCount={advancedFilterCount}
        />
      )}

      {/* Advanced Filter Sheet */}
      <AdvancedFilterSheet
        visible={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleAdvancedFiltersApply}
      />

      {/* Content based on selected tab */}
      <PullToRefresh
        onRefresh={handleRefresh}
        enabled={true}
        tintColor={theme.colors.accent.primary}
        title="Pull to refresh"
        titleColor={theme.colors.text.secondary}
        refreshing={isRefreshing}
      >
        {isSearching ? (
          // Show skeleton loading when searching
          <ScrollView style={styles.listContent}>
            {Array.from({ length: 5 }).map((_, index) => (
              selectedTab === 'receipts' ? (
                <ReceiptListItemSkeleton key={index} />
              ) : (
                <WarrantyListItemSkeleton key={index} />
              )
            ))}
          </ScrollView>
        ) : selectedTab === 'receipts' ? (
          // Receipt List
          groupedReceipts.length > 0 ? (
            <SectionList
              sections={groupedReceipts}
              keyExtractor={(item) => item.id}
              renderItem={renderReceiptItem}
              renderSectionHeader={renderSectionHeader}
              contentContainerStyle={styles.listContent}
              stickySectionHeadersEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState
              icon="document-text-outline"
              title="No receipts found"
              message={
                searchQuery ? 
                  `No receipts match "${searchQuery}"` : 
                  'No receipts match the selected filters'
              }
            />
          )
        ) : (
          // Warranty List
          filteredWarranties.length > 0 ? (
            <FlatList
              data={filteredWarranties}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <WarrantyListItem
                  warranty={item}
                  onPress={() => console.log(`Warranty ${item.id} pressed`)}
                  onLongPress={() => console.log(`Warranty ${item.id} long pressed`)}
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState
              icon="shield-checkmark-outline"
              title="No warranties found"
              message={
                searchQuery ? 
                  `No warranties match "${searchQuery}"` : 
                  'Add warranties to track product expiration dates'
              }
            />
          )
        )}
      </PullToRefresh>
      
      {/* Floating Action Bar */}
      {selectedTab === 'receipts' && (
        <FloatingActionBar
          visible={isSelectionMode && selectedReceiptIds.size > 0}
          selectedCount={selectedReceiptIds.size}
          onCategorize={handleBulkCategorize}
          onDelete={handleBulkDelete}
          onMore={() => setShowBulkActions(true)}
        />
      )}
      
      {/* Bulk Actions Menu */}
      <BulkActionsMenu
        visible={showBulkActions}
        selectedCount={selectedReceiptIds.size}
        onCategorize={handleBulkCategorize}
        onDelete={handleBulkDelete}
        onExport={handleBulkExport}
        onClose={() => setShowBulkActions(false)}
      />
      
      {/* Category Selection Modal */}
      <CategorySelectionModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelectCategory={handleCategorySelect}
      />
      
      {/* Gesture Hints */}
      <GestureHints screen="search" />
    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default SearchScreen;