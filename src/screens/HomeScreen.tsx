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

// Import all components
import MonthlyTotalDisplay from '../components/home/MonthlyTotalDisplay';
import ProgressCard from '../components/home/ProgressCard';
import BlackbirdTabSelector from '../components/home/BlackbirdTabSelector';
import MerchantCard from '../components/home/MerchantCard';
import FeaturedMerchantCard from '../components/home/FeaturedMerchantCard';

const HomeScreen: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'receipts' | 'analytics'>('receipts');
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

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

        {/* Monthly Total Display Section */}
        <MonthlyTotalDisplay 
          amount="$2,348.67"
          month="OCT"
          year="2024"
          onPillPress={() => console.log('Month selector pressed')}
        />

        {/* Progress Card Section */}
        <ProgressCard 
          receiptCount={87}
          receiptGoal={120}
          budgetSpent={2348}
          budgetTotal={3000}
          onPress={() => console.log('Progress card pressed')}
        />

        {/* Tab Selector Section */}
        <BlackbirdTabSelector 
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        {/* Recent Receipts Section */}
        <View style={styles.recentReceiptsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Receipts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentReceipts.map((receipt) => (
            <MerchantCard
              key={receipt.id}
              merchantName={receipt.merchant}
              category={receipt.category}
              amount={receipt.amount}
              date={receipt.date}
              logoUrl={receipt.logoUrl}
              onPress={() => console.log(`Receipt ${receipt.id} pressed`)}
            />
          ))}
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