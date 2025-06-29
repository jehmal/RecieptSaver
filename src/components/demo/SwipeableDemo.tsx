import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SwipeableReceiptCard from '../gestures/SwipeableReceiptCard';
import Toast from 'react-native-toast-message';

const SwipeableDemo: React.FC = () => {
  const handleCategorize = () => {
    Alert.alert('Categorize', 'Categorize action triggered');
  };

  const handleArchive = () => {
    Toast.show({
      type: 'success',
      text1: 'Receipt Archived',
      text2: 'The receipt has been archived',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Receipt',
      'Are you sure you want to delete this receipt?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Toast.show({
              type: 'success',
              text1: 'Receipt Deleted',
              text2: 'The receipt has been deleted',
            });
          }
        }
      ]
    );
  };

  const DemoReceiptItem = () => (
    <View style={styles.receiptItem}>
      <View style={styles.merchantLogo}>
        <Text style={styles.logoText}>🛒</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.merchantName}>Whole Foods Market</Text>
        <Text style={styles.description}>Weekly groceries</Text>
        <Text style={styles.date}>2 days ago</Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.amount}>$142.35</Text>
        <View style={styles.tag}>
          <Text style={styles.tagText}>Groceries</Text>
        </View>
      </View>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Swipeable Demo</Text>
          <Text style={styles.headerSubtitle}>Swipe left or right to see actions</Text>
        </View>

        <View style={styles.listContainer}>
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
            swipeEnabled={true}
          >
            <DemoReceiptItem />
          </SwipeableReceiptCard>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionText}>👈 Swipe left to archive or delete</Text>
          <Text style={styles.instructionText}>👉 Swipe right to categorize</Text>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
  },
  listContainer: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  receiptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  merchantLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#4CD964',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
  },
  contentContainer: {
    flex: 1,
    marginRight: 12,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: '#999999',
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  tag: {
    backgroundColor: '#4CD964',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  instructions: {
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#666666',
    marginVertical: 4,
  },
});

export default SwipeableDemo;