import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { migrateReceiptData, validateNormalizedData, comparePerformance } from '../../utils/receiptMigration';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { safeToFixed } from '../../utils/safeToFixed';

/**
 * Example component showing how to migrate from array-based to normalized receipt storage
 */
export const MigrationExample: React.FC = () => {
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'running' | 'completed' | 'error'>('pending');
  const [validationResult, setValidationResult] = useState<boolean | null>(null);
  const [performanceResults, setPerformanceResults] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkMigrationStatus();
  }, []);

  const checkMigrationStatus = async () => {
    try {
      const normalizedData = await AsyncStorage.getItem('@infinite_receipts_normalized');
      if (normalizedData) {
        setMigrationStatus('completed');
        // Validate the data
        const parsed = JSON.parse(normalizedData);
        const isValid = validateNormalizedData(parsed);
        setValidationResult(isValid);
      }
    } catch (err) {
      console.error('Error checking migration status:', err);
    }
  };

  const handleMigration = async () => {
    try {
      setMigrationStatus('running');
      setError('');
      
      const success = await migrateReceiptData();
      
      if (success) {
        setMigrationStatus('completed');
        await checkMigrationStatus();
      } else {
        setMigrationStatus('error');
        setError('Migration failed. Check console for details.');
      }
    } catch (err) {
      setMigrationStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const handlePerformanceTest = async () => {
    try {
      const results = await comparePerformance();
      setPerformanceResults(results);
    } catch (err) {
      console.error('Performance test failed:', err);
    }
  };

  const clearAllData = async () => {
    try {
      await AsyncStorage.multiRemove([
        '@infinite_receipts',
        '@infinite_receipts_normalized',
      ]);
      setMigrationStatus('pending');
      setValidationResult(null);
      setPerformanceResults(null);
    } catch (err) {
      console.error('Error clearing data:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Receipt Data Migration</Text>

      {/* Migration Status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Migration Status</Text>
        <View style={styles.statusRow}>
          <Text>Status: </Text>
          <Text style={[
            styles.statusValue,
            migrationStatus === 'completed' && styles.statusSuccess,
            migrationStatus === 'error' && styles.statusError,
          ]}>
            {migrationStatus.toUpperCase()}
          </Text>
        </View>
        {validationResult !== null && (
          <View style={styles.statusRow}>
            <Text>Validation: </Text>
            <Text style={[
              styles.statusValue,
              validationResult ? styles.statusSuccess : styles.statusError,
            ]}>
              {validationResult ? 'PASSED' : 'FAILED'}
            </Text>
          </View>
        )}
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>

      {/* Migration Actions */}
      <View style={styles.actionsCard}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        {migrationStatus === 'pending' && (
          <TouchableOpacity style={styles.button} onPress={handleMigration}>
            <Text style={styles.buttonText}>Start Migration</Text>
          </TouchableOpacity>
        )}

        {migrationStatus === 'running' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Migrating data...</Text>
          </View>
        )}

        {migrationStatus === 'completed' && (
          <>
            <TouchableOpacity style={styles.button} onPress={handlePerformanceTest}>
              <Text style={styles.buttonText}>Run Performance Test</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.dangerButton]} 
              onPress={clearAllData}
            >
              <Text style={styles.buttonText}>Clear All Data (Testing)</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Performance Results */}
      {performanceResults && (
        <View style={styles.resultsCard}>
          <Text style={styles.sectionTitle}>Performance Results</Text>
          <Text>Array Lookup: {safeToFixed(performanceResults.arrayTime, 2)}ms</Text>
          <Text>Normalized Lookup: {safeToFixed(performanceResults.normalizedTime, 2)}ms</Text>
          <Text style={styles.improvementText}>
            Performance Improvement: {safeToFixed(performanceResults.improvement * 100, 0)}%
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.sectionTitle}>Migration Guide</Text>
        <Text style={styles.instruction}>
          1. Update App.tsx to import from NormalizedReceiptContext
        </Text>
        <Text style={styles.instruction}>
          2. Run migration to convert existing data
        </Text>
        <Text style={styles.instruction}>
          3. Update components to use new hooks for better performance
        </Text>
        <Text style={styles.instruction}>
          4. Test thoroughly before removing old context
        </Text>
      </View>
    </View>
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
  statusCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  statusValue: {
    fontWeight: '600',
  },
  statusSuccess: {
    color: '#4CAF50',
  },
  statusError: {
    color: '#F44336',
  },
  errorText: {
    color: '#F44336',
    marginTop: 8,
    fontSize: 14,
  },
  actionsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
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
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  resultsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  improvementText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  instructionsCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instruction: {
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
  },
});