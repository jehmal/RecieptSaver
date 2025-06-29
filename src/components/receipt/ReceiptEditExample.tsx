import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Receipt } from '../../contexts/ReceiptContext';
import { useReceiptHistory } from '../../hooks/useReceiptHistory';
import InlineEditField from './InlineEditField';
import QuickEditBar from './QuickEditBar';
import { categoryOptions } from '../../types/filters';
import { validateField, receiptValidationRules } from '../../utils/validation';

// Example receipt data
const exampleReceipt: Receipt = {
  id: '1',
  imageUri: 'https://example.com/receipt.jpg',
  thumbnailUri: 'https://example.com/receipt-thumb.jpg',
  merchant: 'Whole Foods Market',
  amount: 156.78,
  date: '2024-01-15',
  category: 'Groceries',
  notes: 'Weekly grocery shopping',
  isSynced: true,
  createdAt: '2024-01-15T14:30:00Z',
  updatedAt: '2024-01-15T14:30:00Z',
};

const ReceiptEditExample: React.FC = () => {
  const { theme } = useTheme();
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  
  // Use the receipt history hook
  const {
    receipt,
    updateReceipt,
    undo,
    redo,
    canUndo,
    canRedo,
    getHistoryInfo,
  } = useReceiptHistory(exampleReceipt, {
    onHistoryChange: (canUndo, canRedo) => {
      // Could update UI state here
    },
  });

  // Handle field updates
  const handleFieldUpdate = (field: keyof Receipt, value: any, description: string) => {
    updateReceipt({ [field]: value }, description);
  };

  // Validation for merchant field
  const validateMerchant = (value: string): string | null => {
    return validateField(value, receiptValidationRules.merchant);
  };

  // Validation for amount field
  const validateAmount = (value: string): string | null => {
    return validateField(value, receiptValidationRules.amount);
  };

  // Format amount for display
  const formatAmount = (value: string): string => {
    return `$${parseFloat(value).toFixed(2)}`;
  };

  // Show history
  const showHistory = () => {
    const info = getHistoryInfo();
    const historyText = info.entries
      .map((entry, index) => 
        `${entry.isCurrent ? '→ ' : '  '}${index}: ${entry.description} (${new Date(entry.timestamp).toLocaleTimeString()})`
      )
      .join('\n');
    
    Alert.alert('Edit History', historyText);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    historyButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    historyButton: {
      padding: 8,
    },
    content: {
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 12,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      padding: 16,
      ...theme.shadows.sm,
    },
    toggleButton: {
      marginTop: 16,
      height: 44,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    toggleButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    categoryPicker: {
      marginTop: 12,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 8,
      padding: 12,
    },
    categoryOption: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      marginBottom: 4,
      borderRadius: 6,
      backgroundColor: theme.colors.surface,
    },
    categoryOptionText: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    selectedCategory: {
      backgroundColor: theme.colors.primary,
    },
    selectedCategoryText: {
      color: 'white',
    },
    historyInfo: {
      marginTop: 8,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 6,
    },
    historyInfoText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header with Undo/Redo */}
      <View style={styles.header}>
        <Text style={styles.title}>Receipt Edit Example</Text>
        <View style={styles.historyButtons}>
          <TouchableOpacity
            style={[styles.historyButton, { opacity: canUndo ? 1 : 0.3 }]}
            onPress={undo}
            disabled={!canUndo}
          >
            <Ionicons name="arrow-undo" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.historyButton, { opacity: canRedo ? 1 : 0.3 }]}
            onPress={redo}
            disabled={!canRedo}
          >
            <Ionicons name="arrow-redo" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={showHistory}
          >
            <Ionicons name="time-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Inline Edit Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inline Edit Fields</Text>
          <View style={styles.card}>
            <InlineEditField
              label="Merchant Name"
              value={receipt.merchant}
              onSave={(value) => handleFieldUpdate('merchant', value, `Changed merchant to ${value}`)}
              validate={validateMerchant}
            />
            
            <InlineEditField
              label="Amount"
              value={receipt.amount.toString()}
              onSave={(value) => handleFieldUpdate('amount', parseFloat(value), `Changed amount to $${value}`)}
              validate={validateAmount}
              keyboardType="decimal-pad"
              displayValue={formatAmount}
            />
            
            <InlineEditField
              label="Date"
              value={receipt.date}
              onSave={(value) => handleFieldUpdate('date', value, `Changed date to ${value}`)}
              editable={true}
            />
            
            <InlineEditField
              label="Notes"
              value={receipt.notes || ''}
              onSave={(value) => handleFieldUpdate('notes', value, 'Updated notes')}
              multiline
            />
          </View>
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Selection</Text>
          <View style={styles.card}>
            <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginBottom: 8 }}>
              Current: {receipt.category}
            </Text>
            {showCategoryPicker && (
              <View style={styles.categoryPicker}>
                {categoryOptions.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryOption,
                      receipt.category === category && styles.selectedCategory,
                    ]}
                    onPress={() => {
                      handleFieldUpdate('category', category, `Changed category to ${category}`);
                      setShowCategoryPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        receipt.category === category && styles.selectedCategoryText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.toggleButtonText}>
                {showCategoryPicker ? 'Hide Categories' : 'Show Categories'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Edit Bar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Edit Bar</Text>
          <View style={styles.card}>
            <Text style={{ fontSize: 14, color: theme.colors.text.secondary, marginBottom: 12 }}>
              Toggle the quick edit bar for fast inline editing
            </Text>
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => setShowQuickEdit(!showQuickEdit)}
            >
              <Text style={styles.toggleButtonText}>
                {showQuickEdit ? 'Hide Quick Edit' : 'Show Quick Edit'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* History Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Edit History</Text>
          <View style={styles.card}>
            <View style={styles.historyInfo}>
              <Text style={styles.historyInfoText}>
                History: {getHistoryInfo().currentIndex + 1} of {getHistoryInfo().totalEntries} entries
              </Text>
              <Text style={styles.historyInfoText}>
                Can Undo: {canUndo ? 'Yes' : 'No'} | Can Redo: {canRedo ? 'Yes' : 'No'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Quick Edit Bar */}
      {showQuickEdit && (
        <QuickEditBar
          merchant={receipt.merchant}
          amount={receipt.amount}
          category={receipt.category || ''}
          onMerchantChange={(value) => handleFieldUpdate('merchant', value, 'Quick edit merchant')}
          onAmountChange={(value) => handleFieldUpdate('amount', parseFloat(value) || 0, 'Quick edit amount')}
          onCategoryPress={() => setShowCategoryPicker(true)}
          onEditPress={() => Alert.alert('Full Edit', 'This would open the full edit form')}
        />
      )}
    </View>
  );
};

export default ReceiptEditExample;