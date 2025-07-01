import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { normalizeStyle, createShadowStyle, createElevationStyle } from '../../utils';

/**
 * Example component demonstrating proper shadow usage across platforms
 * Shows how to use the style normalizer to handle React Native Web's
 * deprecated shadow* props warning
 */
const ShadowNormalizationExample: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shadow Normalization Examples</Text>
      
      {/* Example 1: Using normalizeStyle with StyleSheet styles */}
      <View style={normalizeStyle(styles.card)}>
        <Text style={styles.cardTitle}>Card with Shadow</Text>
        <Text style={styles.cardText}>
          This card uses normalizeStyle to convert shadow* props to boxShadow on web
        </Text>
      </View>

      {/* Example 2: Using createShadowStyle helper */}
      <View style={[styles.baseCard, createShadowStyle('#000', { width: 0, height: 4 }, 0.3, 8, 4)]}>
        <Text style={styles.cardTitle}>Custom Shadow</Text>
        <Text style={styles.cardText}>
          Uses createShadowStyle helper for cross-platform shadows
        </Text>
      </View>

      {/* Example 3: Using createElevationStyle */}
      <View style={[styles.baseCard, createElevationStyle(8)]}>
        <Text style={styles.cardTitle}>Elevation Shadow</Text>
        <Text style={styles.cardText}>
          Uses createElevationStyle for Material Design elevation
        </Text>
      </View>

      {/* Example 4: Inline styles with normalization */}
      <View 
        style={normalizeStyle([
          styles.baseCard,
          {
            shadowColor: '#2563EB',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.4,
            shadowRadius: 10,
            elevation: 12,
          }
        ])}
      >
        <Text style={styles.cardTitle}>Inline Shadow</Text>
        <Text style={styles.cardText}>
          Inline shadow styles are also normalized
        </Text>
      </View>

      {/* Platform-specific rendering info */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Platform: {Platform.OS}
        </Text>
        <Text style={styles.infoText}>
          {Platform.OS === 'web' 
            ? '✓ Shadow props converted to boxShadow' 
            : '✓ Native shadow props preserved'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    // These shadow props will be converted to boxShadow on web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  baseCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1F2937',
  },
  cardText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#EBF8FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#3182CE',
  },
  infoText: {
    fontSize: 14,
    color: '#2B6CB0',
    marginBottom: 4,
  },
});

export default ShadowNormalizationExample;