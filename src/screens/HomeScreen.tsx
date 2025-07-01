import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { Warranty, sortWarrantiesByExpiry } from '../types/warranty';
import { Receipt } from '../contexts/ReceiptContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { normalizeReceipt, formatCurrency } from '../utils/receiptHelpers';

// Import all components
import BlackbirdTabSelector from '../components/home/BlackbirdTabSelector';
import MerchantCard from '../components/home/MerchantCard';
import EmailReceiptDetectionCard from '../components/home/EmailReceiptDetectionCard';
import DailySummaryCard from '../components/home/DailySummaryCard';
import WarrantyListCard from '../components/home/WarrantyListCard';
import { SwipeableReceiptCard, SwipeableWarrantyCard, SwipeableWrapper } from '../components/gestures';
import WarrantyDetailModal from '../components/warranty/WarrantyDetailModal';

const HomeScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'receipts' | 'warranties'>('receipts');
  const [showWarrantyModal, setShowWarrantyModal] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | null>(null);
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Sample daily summary data
  const dailySummaryData = {
    receiptsToday: 3,
    totalSpendToday: 247.50,
    syncStatus: 'synced' as const,
  };

  // Mock data for email receipt detection
  const emailReceiptData = {
    detectedCount: 8,
    merchants: ['Amazon', 'Uber', 'Starbucks', 'Target', 'Walmart', 'DoorDash'],
  };

  // Sample warranty data
  const warranties: Warranty[] = [
    {
      id: 'w1',
      itemName: 'MacBook Pro 16"',
      serialNumber: 'C02XG2JUH7JG',
      purchaseDate: '2024-06-15',
      expiryDate: '2025-02-15', // ~2 months - amber gradient
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
      expiryDate: '2025-08-20', // >3 months - blue-green gradient
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
      expiryDate: '2025-01-15', // <1 month - red-coral gradient
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
      expiryDate: '2024-01-01', // Expired - gray gradient
      supplier: 'Dell Direct',
      category: 'Electronics',
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    },
  ];
  
  // Sort warranties by expiry date to show most urgent first
  const sortedWarranties = sortWarrantiesByExpiry(warranties);

  // Sample data for recent receipts
  const recentReceipts: Receipt[] = [
    {
      id: '1',
      merchant: 'Whole Foods Market',
      category: 'Groceries',
      amount: 127.43,
      date: new Date().toISOString(),
      imageUri: 'https://via.placeholder.com/400x600/F5F5F5/000000?text=Receipt',
      isSynced: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      merchantLogo: 'https://via.placeholder.com/48x48/4B9C3F/FFFFFF?text=WF',
    },
    {
      id: '2',
      merchant: 'Target',
      category: 'Shopping',
      amount: 89.21,
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      imageUri: 'https://via.placeholder.com/400x600/F5F5F5/000000?text=Receipt',
      isSynced: true,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      merchantLogo: 'https://via.placeholder.com/48x48/CC0000/FFFFFF?text=T',
    },
    {
      id: '3',
      merchant: 'Starbucks',
      category: 'Coffee & Tea',
      amount: 23.67,
      date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      imageUri: 'https://via.placeholder.com/400x600/F5F5F5/000000?text=Receipt',
      isSynced: true,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString(),
      merchantLogo: 'https://via.placeholder.com/48x48/00704A/FFFFFF?text=S',
    },
  ];

  // Receipt gesture handlers
  const handleReceiptPress = useCallback((receiptId: string) => {
    const receipt = recentReceipts.find(r => r.id === receiptId);
    if (receipt) {
      // Ensure the receipt object has the correct types before navigation
      navigation.navigate('ReceiptDetailScreen', { 
        receipt: normalizeReceipt(receipt)
      });
    }
  }, [navigation, recentReceipts]);

  const handleReceiptLongPress = useCallback((receiptId: string) => {
    const receipt = recentReceipts.find(r => r.id === receiptId);
    if (receipt) {
      Toast.show({
        type: 'info',
        text1: 'Quick View',
        text2: `${receipt.merchant} - ${receipt.amount}`,
      });
    }
  }, [recentReceipts]);

  const handleReceiptCategorize = useCallback((receiptId: string) => {
    const receipt = recentReceipts.find(r => r.id === receiptId);
    if (receipt) {
      Toast.show({
        type: 'info',
        text1: 'Categorize',
        text2: `Categorizing receipt from ${receipt.merchant}`,
      });
    }
  }, [recentReceipts]);

  const handleReceiptArchive = useCallback((receiptId: string) => {
    const receipt = recentReceipts.find(r => r.id === receiptId);
    if (receipt) {
      Alert.alert(
        'Archive Receipt',
        `Archive receipt from ${receipt.merchant}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Archive', 
            style: 'default',
            onPress: () => {
              Toast.show({
                type: 'success',
                text1: 'Receipt Archived',
                text2: `${receipt.merchant} receipt has been archived`,
              });
            }
          }
        ]
      );
    }
  }, [recentReceipts]);

  const handleReceiptDelete = useCallback((receiptId: string) => {
    const receipt = recentReceipts.find(r => r.id === receiptId);
    if (receipt) {
      Alert.alert(
        'Delete Receipt',
        `Delete receipt from ${receipt.merchant}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              Toast.show({
                type: 'success',
                text1: 'Receipt Deleted',
                text2: `${receipt.merchant} receipt has been deleted`,
              });
            }
          }
        ]
      );
    }
  }, [recentReceipts]);

  // Warranty gesture handlers
  const handleWarrantyPress = useCallback((warrantyId: string) => {
    const warranty = warranties.find(w => w.id === warrantyId);
    if (warranty) {
      setSelectedWarranty(warranty);
      setShowWarrantyModal(true);
    }
  }, [warranties]);

  const handleWarrantyLongPress = useCallback((warrantyId: string) => {
    const warranty = warranties.find(w => w.id === warrantyId);
    if (warranty) {
      Toast.show({
        type: 'info',
        text1: 'Quick View',
        text2: `${warranty.itemName} - Expires ${warranty.expiryDate}`,
      });
    }
  }, [warranties]);

  const handleWarrantyRenew = useCallback((warrantyId: string) => {
    const warranty = warranties.find(w => w.id === warrantyId);
    if (warranty) {
      Toast.show({
        type: 'info',
        text1: 'Renew Warranty',
        text2: `Renewing warranty for ${warranty.itemName}`,
      });
    }
  }, [warranties]);

  const handleWarrantyShare = useCallback((warrantyId: string) => {
    const warranty = warranties.find(w => w.id === warrantyId);
    if (warranty) {
      Toast.show({
        type: 'success',
        text1: 'Warranty Shared',
        text2: `${warranty.itemName} warranty has been shared`,
      });
    }
  }, [warranties]);

  const handleWarrantyArchive = useCallback((warrantyId: string) => {
    const warranty = warranties.find(w => w.id === warrantyId);
    if (warranty) {
      Alert.alert(
        'Archive Warranty',
        `Archive warranty for ${warranty.itemName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Archive', 
            style: 'default',
            onPress: () => {
              Toast.show({
                type: 'success',
                text1: 'Warranty Archived',
                text2: `${warranty.itemName} warranty has been archived`,
              });
            }
          }
        ]
      );
    }
  }, [warranties]);

  const handleWarrantyDelete = useCallback((warrantyId: string) => {
    const warranty = warranties.find(w => w.id === warrantyId);
    if (warranty) {
      Alert.alert(
        'Delete Warranty',
        `Delete warranty for ${warranty.itemName}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              Toast.show({
                type: 'success',
                text1: 'Warranty Deleted',
                text2: `${warranty.itemName} warranty has been deleted`,
              });
            }
          }
        ]
      );
    }
  }, [warranties]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100, // Account for tab bar
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    profileImageContainer: {
      width: 56,
      height: 56,
    },
    profileImage: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.colors.card.border,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    recentReceiptsSection: {
      marginTop: theme.spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    seeAllText: {
      fontSize: 16,
      color: theme.colors.accent.primary,
      fontWeight: '500',
    },
    greetingSection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    greetingText: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    subGreetingText: {
      fontSize: 18,
      fontWeight: '400',
      color: theme.colors.text.secondary,
    },
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.profileImageContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/56x56/E5E5EA/8E8E93?text=User' }}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('ProfileScreen')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>Hi {user?.firstName || 'there'}!</Text>
          <Text style={styles.subGreetingText}>Your receipts, organized</Text>
        </View>

        {/* Daily Summary Card */}
        <DailySummaryCard
          receiptsToday={dailySummaryData.receiptsToday}
          totalSpendToday={dailySummaryData.totalSpendToday}
          syncStatus={dailySummaryData.syncStatus}
          onPress={() => console.log('Daily summary pressed')}
        />

        {/* Tab Selector Section */}
        <BlackbirdTabSelector 
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* Recent Items Section */}
        <View style={styles.recentReceiptsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedTab === 'receipts' ? 'Recent Receipts' : 'Expiring Soon'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {selectedTab === 'receipts' ? (
            recentReceipts.map((receipt) => (
              <SwipeableWrapper key={receipt.id}>
                <SwipeableReceiptCard
                  leftActions={[
                    {
                      type: 'categorize',
                      color: '#007AFF',
                      icon: 'pricetag',
                      label: 'Category',
                      onPress: () => handleReceiptCategorize(receipt.id),
                    }
                  ]}
                  rightActions={[
                    {
                      type: 'archive',
                      color: '#FF9500',
                      icon: 'archive',
                      label: 'Archive',
                      onPress: () => handleReceiptArchive(receipt.id),
                    },
                    {
                      type: 'delete',
                      color: '#FF3B30',
                      icon: 'trash',
                      label: 'Delete',
                      onPress: () => handleReceiptDelete(receipt.id),
                    }
                  ]}
                  onLongPress={() => handleReceiptLongPress(receipt.id)}
                  onDoubleTap={() => handleReceiptPress(receipt.id)}
                  swipeEnabled={true}
                >
                  <MerchantCard
                    merchantName={receipt.merchant}
                    category={receipt.category}
                    amount={formatCurrency(receipt.amount)}
                    date={new Date(receipt.date).toLocaleDateString()}
                    logoUrl={receipt.merchantLogo}
                    onPress={() => handleReceiptPress(receipt.id)}
                  />
                </SwipeableReceiptCard>
              </SwipeableWrapper>
            ))
          ) : (
            sortedWarranties.map((warranty) => (
              <SwipeableWrapper key={warranty.id}>
                <SwipeableWarrantyCard
                  leftActions={[
                    {
                      type: 'renew',
                      color: '#34C759',
                      icon: 'refresh',
                      label: 'Renew',
                      onPress: () => handleWarrantyRenew(warranty.id),
                    },
                    {
                      type: 'share',
                      color: '#007AFF',
                      icon: 'share',
                      label: 'Share',
                      onPress: () => handleWarrantyShare(warranty.id),
                    }
                  ]}
                  rightActions={[
                    {
                      type: 'archive',
                      color: '#FF9500',
                      icon: 'archive',
                      label: 'Archive',
                      onPress: () => handleWarrantyArchive(warranty.id),
                    },
                    {
                      type: 'delete',
                      color: '#FF3B30',
                      icon: 'trash',
                      label: 'Delete',
                      onPress: () => handleWarrantyDelete(warranty.id),
                    }
                  ]}
                  onLongPress={() => handleWarrantyLongPress(warranty.id)}
                  onDoubleTap={() => handleWarrantyPress(warranty.id)}
                  swipeEnabled={true}
                >
                  <WarrantyListCard
                    itemName={warranty.itemName}
                    serialNumber={warranty.serialNumber}
                    purchaseDate={warranty.purchaseDate}
                    expiryDate={warranty.expiryDate}
                    supplier={warranty.supplier}
                    category={warranty.category}
                    onPress={() => handleWarrantyPress(warranty.id)}
                  />
                </SwipeableWarrantyCard>
              </SwipeableWrapper>
            ))
          )}
        </View>
        
        {/* Email Receipt Detection Section */}
        <EmailReceiptDetectionCard
          detectedCount={emailReceiptData.detectedCount}
          merchantNames={emailReceiptData.merchants}
          onImportPress={() => {
            console.log('Import receipts from email');
            Toast.show({
              type: 'info',
              text1: 'Email Import',
              text2: 'This feature is coming soon!',
            });
          }}
          onDismissPress={() => {
            console.log('Dismissed email receipts');
            Toast.show({
              type: 'success',
              text1: 'Dismissed',
              text2: 'We\'ll remind you later about these receipts',
            });
          }}
        />
      </ScrollView>
      
      {/* Warranty Detail Modal */}
      <WarrantyDetailModal
        visible={showWarrantyModal}
        warranty={selectedWarranty}
        onClose={() => {
          setShowWarrantyModal(false);
          setSelectedWarranty(null);
        }}
        onActionPress={(action) => {
          console.log('Warranty action pressed:', action);
          // Handle warranty actions here
        }}
      />
      
      {/* Toast messages */}
      <Toast />
    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default HomeScreen;