/**
 * Example component demonstrating safe toFixed usage and web patches
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Platform } from 'react-native';
import { safeToFixed } from '../../utils/safeToFixed';
import { 
  testWebStylePatches, 
  monitorToFixedCalls,
  toFixedErrorAnalyzer 
} from '../../utils/developmentHelpers';

export const SafeToFixedExample: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Test cases that would normally cause toFixed errors
  const problematicValues = [
    { label: 'Number Object', value: new Number(123.456) },
    { label: 'NaN', value: NaN },
    { label: 'Infinity', value: Infinity },
    { label: 'Null', value: null },
    { label: 'Undefined', value: undefined },
    { label: 'String Number', value: '123.456' },
    { label: 'Currency String', value: '$123.456' },
    { label: 'Object', value: { valueOf: () => 123.456 } },
  ];

  const runTests = () => {
    const results: string[] = [];
    
    results.push('=== Testing safeToFixed ===');
    problematicValues.forEach(({ label, value }) => {
      try {
        const result = safeToFixed(value, 2);
        results.push(`✅ ${label}: ${result}`);
      } catch (error) {
        results.push(`❌ ${label}: Error - ${error}`);
      }
    });

    // Test direct toFixed calls (should be patched)
    results.push('\n=== Testing Patched toFixed ===');
    problematicValues.forEach(({ label, value }) => {
      try {
        // This would normally error but our patches handle it
        const result = (value as any)?.toFixed?.(2) || 'No toFixed method';
        results.push(`✅ ${label}: ${result}`);
      } catch (error) {
        results.push(`❌ ${label}: Error - ${error}`);
      }
    });

    // Check patch status
    const isPatched = (Number.prototype.toFixed as any).__patched === true;
    results.push(`\nPatch Status: ${isPatched ? '✅ Applied' : '❌ Not Applied'}`);
    results.push(`Platform: ${Platform.OS}`);

    setTestResults(results);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    monitorToFixedCalls(5000);
    setTimeout(() => setIsMonitoring(false), 5000);
  };

  const showErrorSummary = () => {
    const summary = toFixedErrorAnalyzer.getSummary();
    const results = [
      '=== toFixed Error Summary ===',
      `Total Errors: ${summary.totalErrors}`,
      '\nErrors by Type:',
      ...Object.entries(summary.byType).map(([type, count]) => `  ${type}: ${count}`),
      '\nErrors by Location:',
      ...Object.entries(summary.byLocation).map(([loc, count]) => `  ${loc}: ${count}`),
    ];
    setTestResults(results);
  };

  useEffect(() => {
    // Run web style patch test on mount in development
    if (__DEV__ && Platform.OS === 'web') {
      console.log('[SafeToFixedExample] Running web style patch tests...');
      testWebStylePatches();
    }
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>toFixed Safety Demo</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Problematic Values:</Text>
        {problematicValues.map(({ label, value }, index) => (
          <Text key={index} style={styles.valueText}>
            {label}: {String(value)} (type: {typeof value})
          </Text>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Run Tests" onPress={runTests} />
        <Button 
          title={isMonitoring ? "Monitoring..." : "Monitor toFixed (5s)"} 
          onPress={startMonitoring}
          disabled={isMonitoring}
        />
        <Button title="Show Error Summary" onPress={showErrorSummary} />
      </View>

      {testResults.length > 0 && (
        <View style={styles.results}>
          <Text style={styles.resultsTitle}>Test Results:</Text>
          {testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>{result}</Text>
          ))}
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.infoTitle}>How It Works:</Text>
        <Text style={styles.infoText}>
          1. safeToFixed() handles all edge cases gracefully{'\n'}
          2. Web patches intercept toFixed calls in React Native Web{'\n'}
          3. Development helpers provide debugging information{'\n'}
          4. Errors are tracked and analyzed automatically
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  valueText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 10,
  },
  results: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    maxHeight: 300,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 12,
    marginBottom: 3,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'System',
  },
  info: {
    backgroundColor: '#e8f4f8',
    padding: 15,
    borderRadius: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});