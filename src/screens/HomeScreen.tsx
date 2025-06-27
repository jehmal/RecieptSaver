import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { Warranty, sortWarrantiesByExpiry } from '../types/warranty';

// Import all components
import BlackbirdTabSelector from '../components/home/BlackbirdTabSelector';
import MerchantCard from '../components/home/MerchantCard';
import FeaturedMerchantCard from '../components/home/FeaturedMerchantCard';
import DailySummaryCard from '../components/home/DailySummaryCard';
import WarrantyCard from '../components/home/WarrantyCard';

const HomeScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'receipts' | 'warranties'>('receipts');
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  // Sample daily summary data
  const dailySummaryData = {
    receiptsToday: 3,
    totalSpendToday: 247.50,
    syncStatus: 'synced' as const,
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
  const recentReceipts = [
    {
      id: '1',
      merchant: 'Whole Foods Market',
      category: 'Groceries',
      amount: '$127.43',
      date: 'Today',
      logoUrl: 'https://via.placeholder.com/48x48/4B9C3F/FFFFFF?text=WF',
    },
    {
      id: '2',
      merchant: 'Target',
      category: 'Shopping',
      amount: '$89.21',
      date: 'Yesterday',
      logoUrl: 'https://via.placeholder.com/48x48/CC0000/FFFFFF?text=T',
    },
    {
      id: '3',
      merchant: 'Starbucks',
      category: 'Coffee & Tea',
      amount: '$23.67',
      date: '2 days ago',
      logoUrl: 'https://via.placeholder.com/48x48/00704A/FFFFFF?text=S',
    },
  ];

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
              <MerchantCard
                key={receipt.id}
                merchantName={receipt.merchant}
                category={receipt.category}
                amount={receipt.amount}
                date={receipt.date}
                logoUrl={receipt.logoUrl}
                onPress={() => console.log(`Receipt ${receipt.id} pressed`)}
              />
            ))
          ) : (
            sortedWarranties.map((warranty) => (
              <WarrantyCard
                key={warranty.id}
                itemName={warranty.itemName}
                serialNumber={warranty.serialNumber}
                purchaseDate={warranty.purchaseDate}
                expiryDate={warranty.expiryDate}
                supplier={warranty.supplier}
                onPress={() => console.log(`Warranty ${warranty.id} pressed`)}
              />
            ))
          )}
        </View>
        
        {/* Featured Merchant Section */}
        <FeaturedMerchantCard
          title="Top Merchant"
          subtitle="Most Visited This Month"
          description="You've saved $247 with Whole Foods rewards this month"
          imageUrl="https://via.placeholder.com/400x240/4B9C3F/FFFFFF?text=Whole+Foods"
          onPress={() => console.log('Featured merchant pressed')}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;