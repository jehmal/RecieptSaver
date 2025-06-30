import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Receipt } from '../../contexts/ReceiptContext';
import { shareReceipt, exportReceiptAsPDF, shareReceiptAsText } from '../../utils/receiptExport';

// Example receipt data for testing
const exampleReceipt: Receipt = {
  id: 'example-001',
  merchant: 'Starbucks Coffee',
  amount: 12.50,
  date: new Date().toISOString(),
  category: 'Food & Dining',
  tags: ['Coffee', 'Business', 'Breakfast'],
  notes: 'Morning coffee meeting with client',
  imageUri: '', // Would contain actual image URI in production
  isSynced: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  paymentMethod: 'Credit Card •••• 1234',
};

const ShareExample: React.FC = () => {
  const { theme } = useTheme();

  const handleSharePDF = async () => {
    try {
      await shareReceipt(exampleReceipt, { format: 'pdf' });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share PDF');
    }
  };

  const handleShareImage = async () => {
    if (!exampleReceipt.imageUri) {
      Alert.alert('Info', 'This example doesn\'t have an image. In production, receipt images would be available.');
      return;
    }
    try {
      await shareReceipt(exampleReceipt, { format: 'image' });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share image');
    }
  };

  const handleShareText = async () => {
    try {
      await shareReceiptAsText(exampleReceipt);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to share text');
    }
  };

  const handleExportPDF = async () => {
    try {
      const pdfUri = await exportReceiptAsPDF(exampleReceipt);
      if (pdfUri) {
        Alert.alert('Success', `PDF exported to: ${pdfUri}`);
      } else {
        Alert.alert('Error', 'Failed to export PDF');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to export PDF');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: theme.colors.background,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginBottom: 30,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 15,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.card.background,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    buttonIcon: {
      marginRight: 12,
    },
    buttonText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      flex: 1,
    },
    exampleInfo: {
      backgroundColor: theme.colors.surfaceLight,
      padding: 16,
      borderRadius: 12,
      marginBottom: 20,
    },
    exampleText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share & Export Example</Text>
      <Text style={styles.subtitle}>
        Test the sharing and export functionality with an example receipt
      </Text>

      <View style={styles.exampleInfo}>
        <Text style={styles.exampleText}>
          Example Receipt: {exampleReceipt.merchant} - ${exampleReceipt.amount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Share Options</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleSharePDF}>
          <Ionicons name="document-outline" size={24} color={theme.colors.accent.primary} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Share as PDF</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleShareImage}>
          <Ionicons name="image-outline" size={24} color={theme.colors.accent.primary} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Share as Image</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleShareText}>
          <Ionicons name="text-outline" size={24} color={theme.colors.accent.primary} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Share as Text</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Export Options</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleExportPDF}>
          <Ionicons name="download-outline" size={24} color={theme.colors.accent.primary} style={styles.buttonIcon} />
          <Text style={styles.buttonText}>Export as PDF</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ShareExample;