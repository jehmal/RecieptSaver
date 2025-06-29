import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import SelectableReceiptListItem from '../components/search/SelectableReceiptListItem';
import ReceiptListItem from '../components/search/ReceiptListItem';
import { SwipeableReceiptCard, LongPressWrapper } from '../components/gestures';
import * as Haptics from 'expo-haptics';

const TestLongPressScreen: React.FC = () => {
  const { theme } = useTheme();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Sample receipt
  const sampleReceipt = {
    id: '1',
    merchant: 'Whole Foods Market',
    amount: 127.84,
    date: new Date(),
    tags: [
      { id: '1', name: 'Business', color: '#007AFF' },
      { id: '2', name: 'Food', color: '#FF9500' },
    ],
    category: 'Groceries',
    paymentMethod: 'Apple Pay',
    description: 'Grocery shopping',
    merchantLogo: '🛒',
    merchantColor: '#00674B',
  };

  const handleLongPress = (receiptId: string) => {
    console.log('Long press detected!', receiptId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsSelectionMode(true);
    setSelectedIds(new Set([receiptId]));
    Alert.alert('Long Press', 'Selection mode activated!');
  };

  const handlePress = (receiptId: string) => {
    console.log('Press detected!', receiptId);
    if (isSelectionMode) {
      const newSet = new Set(selectedIds);
      if (newSet.has(receiptId)) {
        newSet.delete(receiptId);
      } else {
        newSet.add(receiptId);
      }
      setSelectedIds(newSet);
    } else {
      Alert.alert('Press', `Receipt ${receiptId} pressed`);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
    },
    section: {
      marginTop: 20,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 10,
    },
    description: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 10,
    },
    statusText: {
      fontSize: 16,
      color: theme.colors.accent.primary,
      marginVertical: 10,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.title}>Long Press Test</Text>
          <Text style={styles.statusText}>
            Selection Mode: {isSelectionMode ? 'ON' : 'OFF'}
          </Text>
          <Text style={styles.statusText}>
            Selected: {selectedIds.size} items
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test 1: Basic ReceiptListItem</Text>
          <Text style={styles.description}>Long press on this item:</Text>
          <ReceiptListItem
            receipt={sampleReceipt}
            onPress={() => handlePress(sampleReceipt.id)}
            onLongPress={() => handleLongPress(sampleReceipt.id)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test 2: SelectableReceiptListItem</Text>
          <Text style={styles.description}>This component handles selection internally:</Text>
          <SelectableReceiptListItem
            receipt={{ ...sampleReceipt, id: '2' }}
            isSelected={selectedIds.has('2')}
            isSelectionMode={isSelectionMode}
            onPress={() => handlePress('2')}
            onLongPress={() => handleLongPress('2')}
            onSelectionToggle={() => handlePress('2')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test 3: SwipeableReceiptCard</Text>
          <Text style={styles.description}>Long press with swipe actions:</Text>
          <SwipeableReceiptCard
            leftActions={[
              {
                type: 'categorize',
                color: '#007AFF',
                icon: 'pricetag',
                label: 'Category',
                onPress: () => Alert.alert('Action', 'Categorize'),
              }
            ]}
            rightActions={[
              {
                type: 'delete',
                color: '#FF3B30',
                icon: 'trash',
                label: 'Delete',
                onPress: () => Alert.alert('Action', 'Delete'),
              }
            ]}
            onLongPress={() => handleLongPress('3')}
            swipeEnabled={!isSelectionMode}
          >
            <ReceiptListItem
              receipt={{ ...sampleReceipt, id: '3' }}
              onPress={() => handlePress('3')}
              onLongPress={() => handleLongPress('3')}
            />
          </SwipeableReceiptCard>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test 4: LongPressWrapper</Text>
          <Text style={styles.description}>Enhanced long press with animations:</Text>
          <LongPressWrapper
            onLongPress={() => handleLongPress('4')}
            onPress={() => handlePress('4')}
          >
            <ReceiptListItem
              receipt={{ ...sampleReceipt, id: '4' }}
            />
          </LongPressWrapper>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TestLongPressScreen;