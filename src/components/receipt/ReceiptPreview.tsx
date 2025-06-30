import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthButton } from '../auth/AuthButton';
import { OCRResult } from '../../services/ocrService';

interface ReceiptPreviewProps {
  imageUri: string;
  ocrResult: OCRResult;
  onConfirm: (editedData: EditedReceiptData) => void;
  onRetry: () => void;
  isProcessing?: boolean;
}

interface EditedReceiptData {
  merchantName: string;
  date: string;
  totalAmount: string;
  items: Array<{
    name: string;
    price: string;
    quantity: string;
  }>;
  category: string;
  paymentMethod: string;
}

const ReceiptPreviewComponent: React.FC<ReceiptPreviewProps> = ({
  imageUri,
  ocrResult,
  onConfirm,
  onRetry,
  isProcessing = false,
}) => {
  const { theme } = useTheme();
  
  // Initialize state with OCR results
  const [editedData, setEditedData] = useState<EditedReceiptData>({
    merchantName: ocrResult.merchantName || '',
    date: ocrResult.date ? new Date(ocrResult.date).toLocaleDateString() : new Date().toLocaleDateString(),
    totalAmount: ocrResult.totalAmount?.toFixed(2) || '0.00',
    items: ocrResult.items?.map(item => ({
      name: item.name,
      price: item.price.toFixed(2),
      quantity: (item.quantity || 1).toString(),
    })) || [],
    category: 'Shopping',
    paymentMethod: 'Credit Card',
  });

  const [showFullImage, setShowFullImage] = useState(false);

  const handleAddItem = useCallback(() => {
    setEditedData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', price: '0.00', quantity: '1' }],
    }));
  }, []);

  const handleRemoveItem = useCallback((index: number) => {
    setEditedData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const handleItemChange = useCallback((index: number, field: keyof typeof editedData.items[0], value: string) => {
    setEditedData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  }, []);

  const calculateTotal = useCallback(() => {
    return editedData.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0).toFixed(2);
  }, [editedData.items]);

  const calculatedTotal = useMemo(() => calculateTotal(), [calculateTotal]);

  const handleConfirm = useCallback(() => {
    // Validate required fields
    if (!editedData.merchantName.trim()) {
      Alert.alert('Missing Information', 'Please enter the merchant name');
      return;
    }

    // Update total with calculated value
    onConfirm({
      ...editedData,
      totalAmount: calculatedTotal,
    });
  }, [editedData, calculatedTotal, onConfirm]);

  if (isProcessing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
          Processing receipt...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Receipt Image Preview */}
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setShowFullImage(true)}
          style={styles.imageContainer}
        >
          <Image 
            source={{ uri: imageUri }} 
            style={styles.receiptImage}
            resizeMode="cover"
          />
          <View style={[styles.imageOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]}>
            <Ionicons name="expand" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        {/* OCR Confidence Indicator */}
        <View style={[styles.confidenceContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.confidenceLabel, { color: theme.colors.text.secondary }]}>
            OCR Confidence
          </Text>
          <View style={styles.confidenceBar}>
            <View 
              style={[
                styles.confidenceProgress, 
                { 
                  backgroundColor: ocrResult.confidence > 0.8 
                    ? theme.colors.accent.success 
                    : theme.colors.accent.warning,
                  width: `${ocrResult.confidence * 100}%` 
                }
              ]} 
            />
          </View>
          <Text style={[styles.confidenceValue, { color: theme.colors.text.primary }]}>
            {(ocrResult.confidence * 100).toFixed(0)}%
          </Text>
        </View>

        {/* Editable Fields */}
        <View style={styles.formSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Receipt Details
          </Text>

          {/* Merchant Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>
              Merchant
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surface,
                color: theme.colors.text.primary,
                borderColor: theme.colors.card.border,
              }]}
              value={editedData.merchantName}
              onChangeText={(text) => setEditedData(prev => ({ ...prev, merchantName: text }))}
              placeholder="Enter merchant name"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>

          {/* Date and Category */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>
                Date
              </Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.card.border,
                }]}
                value={editedData.date}
                onChangeText={(text) => setEditedData(prev => ({ ...prev, date: text }))}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={theme.colors.text.tertiary}
              />
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>
                Category
              </Text>
              <TouchableOpacity
                style={[styles.input, styles.selectInput, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.card.border,
                }]}
              >
                <Text style={{ color: theme.colors.text.primary }}>
                  {editedData.category}
                </Text>
                <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: theme.colors.text.secondary }]}>
              Payment Method
            </Text>
            <TouchableOpacity
              style={[styles.input, styles.selectInput, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.card.border,
              }]}
            >
              <Text style={{ color: theme.colors.text.primary }}>
                {editedData.paymentMethod}
              </Text>
              <Ionicons name="chevron-down" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Items Section */}
          <View style={styles.itemsSection}>
            <View style={styles.itemsHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Items
              </Text>
              <TouchableOpacity onPress={handleAddItem}>
                <Ionicons name="add-circle" size={24} color={theme.colors.accent.primary} />
              </TouchableOpacity>
            </View>

            {editedData.items.map((item, index) => (
              <View key={index} style={[styles.itemRow, { backgroundColor: theme.colors.surface }]}>
                <TextInput
                  style={[styles.itemInput, styles.itemNameInput, { 
                    color: theme.colors.text.primary,
                    borderColor: theme.colors.card.border,
                  }]}
                  value={item.name}
                  onChangeText={(text) => handleItemChange(index, 'name', text)}
                  placeholder="Item name"
                  placeholderTextColor={theme.colors.text.tertiary}
                />
                <TextInput
                  style={[styles.itemInput, styles.itemQuantityInput, { 
                    color: theme.colors.text.primary,
                    borderColor: theme.colors.card.border,
                  }]}
                  value={item.quantity}
                  onChangeText={(text) => handleItemChange(index, 'quantity', text)}
                  placeholder="Qty"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.itemInput, styles.itemPriceInput, { 
                    color: theme.colors.text.primary,
                    borderColor: theme.colors.card.border,
                  }]}
                  value={item.price}
                  onChangeText={(text) => handleItemChange(index, 'price', text)}
                  placeholder="0.00"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="decimal-pad"
                />
                <TouchableOpacity onPress={() => handleRemoveItem(index)}>
                  <Ionicons name="remove-circle" size={20} color={theme.colors.accent.error} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Total */}
            <View style={[styles.totalRow, { borderTopColor: theme.colors.card.border }]}>
              <Text style={[styles.totalLabel, { color: theme.colors.text.primary }]}>
                Total
              </Text>
              <Text style={[styles.totalAmount, { color: theme.colors.accent.primary }]}>
                ${calculatedTotal}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <AuthButton
            title="Retry Capture"
            variant="secondary"
            onPress={onRetry}
            style={{ flex: 1, marginRight: 8 }}
          />
          <AuthButton
            title="Confirm & Save"
            variant="primary"
            onPress={handleConfirm}
            style={{ flex: 1, marginLeft: 8 }}
          />
        </View>
      </ScrollView>

      {/* Full Image Modal */}
      {showFullImage && (
        <TouchableOpacity 
          style={styles.fullImageModal}
          activeOpacity={1}
          onPress={() => setShowFullImage(false)}
        >
          <Image 
            source={{ uri: imageUri }} 
            style={styles.fullImage}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFullImage(false)}
          >
            <Ionicons name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  confidenceLabel: {
    fontSize: 14,
    marginRight: 12,
  },
  confidenceBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(142, 142, 147, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  confidenceProgress: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  formSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  row: {
    flexDirection: 'row',
  },
  itemsSection: {
    marginTop: 24,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  itemInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  itemNameInput: {
    flex: 3,
  },
  itemQuantityInput: {
    flex: 1,
    textAlign: 'center',
  },
  itemPriceInput: {
    flex: 1.5,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  fullImageModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '90%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export const ReceiptPreview = memo(ReceiptPreviewComponent);