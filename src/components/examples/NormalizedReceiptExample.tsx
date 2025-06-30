import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { 
  useReceipts, 
  useReceiptData, 
  useReceiptActions 
} from '../../contexts/NormalizedReceiptContext';
import {
  useReceiptById,
  useReceiptsByIds,
  useFilteredReceipts,
  useReceiptsByMerchant,
  useUnsyncedReceipts,
  useReceiptCount,
  useReceiptStats,
  useSortedReceipts,
  useBatchReceiptOperations,
} from '../../hooks/useNormalizedReceipts';

/**
 * Example component demonstrating the usage of normalized receipt context
 */
export const NormalizedReceiptExample: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('');
  const [merchantFilter, setMerchantFilter] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Basic context usage
  const { receipts, receiptById, receiptIds } = useReceiptData();
  const { addReceipt, updateReceipt, deleteReceipt, getReceipt } = useReceiptActions();

  // Custom hooks usage
  const selectedReceipt = useReceiptById(selectedId);
  const selectedReceipts = useReceiptsByIds(selectedIds);
  const merchantReceipts = useReceiptsByMerchant(merchantFilter);
  const unsyncedReceipts = useUnsyncedReceipts();
  const receiptCount = useReceiptCount();
  const stats = useReceiptStats();
  const sortedByDate = useSortedReceipts('date', 'desc');
  const { batchUpdate, batchDelete } = useBatchReceiptOperations();

  // Example of filtered receipts with custom predicate
  const highValueReceipts = useFilteredReceipts(
    useCallback((receipt) => receipt.amount > 100, [])
  );

  // O(1) lookup example
  const handleQuickLookup = (id: string) => {
    console.time('O(1) Lookup');
    const receipt = receiptById[id]; // Direct O(1) access
    console.timeEnd('O(1) Lookup');
    console.log('Found receipt:', receipt);
  };

  // Batch operations example
  const handleBatchSync = async () => {
    const updates = unsyncedReceipts.map((receipt) => ({
      id: receipt.id,
      data: { isSynced: true },
    }));
    await batchUpdate(updates);
  };

  const handleBatchDelete = async () => {
    await batchDelete(selectedIds);
    setSelectedIds([]);
  };

  // Performance comparison
  const performanceDemo = () => {
    const testId = receiptIds[0];
    if (!testId) return;

    // Old way (O(n))
    console.time('Array find');
    const found1 = receipts.find(r => r.id === testId);
    console.timeEnd('Array find');

    // New way (O(1))
    console.time('Direct access');
    const found2 = receiptById[testId];
    console.timeEnd('Direct access');

    console.log('Both methods found same receipt:', found1?.id === found2?.id);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Normalized Receipt Context Example</Text>

      {/* Stats Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Receipt Statistics</Text>
        <Text>Total Receipts: {receiptCount}</Text>
        <Text>Total Amount: ${stats.totalAmount.toFixed(2)}</Text>
        <Text>Average Amount: ${stats.averageAmount.toFixed(2)}</Text>
        <Text>Synced: {stats.syncedCount} | Unsynced: {stats.unsyncedCount}</Text>
      </View>

      {/* O(1) Lookup Demo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>O(1) Lookup Demo</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter receipt ID"
          value={selectedId}
          onChangeText={setSelectedId}
        />
        <TouchableOpacity 
          style={styles.button}
          onPress={() => handleQuickLookup(selectedId)}
        >
          <Text style={styles.buttonText}>Lookup Receipt (O(1))</Text>
        </TouchableOpacity>
        {selectedReceipt && (
          <View style={styles.result}>
            <Text>Merchant: {selectedReceipt.merchant}</Text>
            <Text>Amount: ${selectedReceipt.amount}</Text>
            <Text>Date: {new Date(selectedReceipt.date).toLocaleDateString()}</Text>
          </View>
        )}
      </View>

      {/* Filter by Merchant */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filter by Merchant</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter merchant name"
          value={merchantFilter}
          onChangeText={setMerchantFilter}
        />
        <Text>Found {merchantReceipts.length} receipts</Text>
      </View>

      {/* High Value Receipts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>High Value Receipts (&gt;$100)</Text>
        <Text>Count: {highValueReceipts.length}</Text>
        <FlatList
          data={highValueReceipts.slice(0, 5)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text>{item.merchant} - ${item.amount}</Text>
            </View>
          )}
        />
      </View>

      {/* Batch Operations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Batch Operations</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={handleBatchSync}
        >
          <Text style={styles.buttonText}>
            Sync All Unsynced ({unsyncedReceipts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Performance Test */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance Test</Text>
        <TouchableOpacity 
          style={styles.button}
          onPress={performanceDemo}
        >
          <Text style={styles.buttonText}>Run Performance Comparison</Text>
        </TouchableOpacity>
      </View>

      {/* Categories Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories Breakdown</Text>
        {Object.entries(stats.byCategory).map(([category, data]) => (
          <View key={category} style={styles.categoryItem}>
            <Text>{category}: {data.count} receipts</Text>
            <Text>Total: ${data.total.toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  result: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  listItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
});