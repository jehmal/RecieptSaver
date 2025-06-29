import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';
import { Receipt } from '../../contexts/ReceiptContext';
import { categoryOptions } from '../../types/filters';
import {
  validateForm,
  receiptValidationRules,
  itemValidationRules,
  ValidationErrors,
  formatCurrency,
  formatDate,
  parseDate,
} from '../../utils/validation';

interface ReceiptEditFormProps {
  receipt: Receipt;
  onSave: (updatedReceipt: Receipt) => void;
  onCancel: () => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface EditHistory {
  timestamp: Date;
  field: string;
  oldValue: any;
  newValue: any;
}

const ReceiptEditForm: React.FC<ReceiptEditFormProps> = ({
  receipt,
  onSave,
  onCancel,
  autoSave = true,
  autoSaveDelay = 2000,
}) => {
  const { theme } = useTheme();
  
  // Form state
  const [formData, setFormData] = useState<Receipt>({
    ...receipt,
  });
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [showUndoRedo, setShowUndoRedo] = useState(false);
  
  // Refs
  const autoSaveTimer = useRef<NodeJS.Timeout>();
  const historyIndex = useRef(0);

  // Initialize items from receipt notes (assuming items are stored as JSON in notes)
  useEffect(() => {
    try {
      if (receipt.notes) {
        const parsedItems = JSON.parse(receipt.notes);
        if (Array.isArray(parsedItems)) {
          setItems(parsedItems);
        }
      }
    } catch (e) {
      // If notes is not valid JSON, initialize with empty items
      setItems([]);
    }
  }, [receipt.notes]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDirty) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }

      autoSaveTimer.current = setTimeout(() => {
        handleSave(true);
      }, autoSaveDelay);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [formData, items, isDirty, autoSave, autoSaveDelay]);

  // Track changes for undo/redo
  const trackChange = (field: string, oldValue: any, newValue: any) => {
    const newHistory = editHistory.slice(0, historyIndex.current + 1);
    newHistory.push({
      timestamp: new Date(),
      field,
      oldValue,
      newValue,
    });
    setEditHistory(newHistory);
    historyIndex.current = newHistory.length - 1;
    setShowUndoRedo(true);
  };

  // Handle field changes
  const handleFieldChange = (field: keyof Receipt, value: any) => {
    const oldValue = formData[field];
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    trackChange(field, oldValue, value);
    
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Handle amount change with formatting
  const handleAmountChange = (value: string) => {
    const formatted = formatCurrency(value);
    handleFieldChange('amount', parseFloat(formatted) || 0);
  };

  // Handle date change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleFieldChange('date', formatDate(selectedDate));
    }
  };

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    handleFieldChange('category', category);
    setShowCategoryPicker(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Item management
  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0,
    };
    setItems((prev) => [...prev, newItem]);
    setIsDirty(true);
  };

  const updateItem = (itemId: string, field: keyof ReceiptItem, value: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
    setIsDirty(true);
  };

  const removeItem = (itemId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setIsDirty(true);
  };

  // Calculate total from items
  const calculateTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);

  // Validation
  const validateFormData = (): boolean => {
    const formErrors = validateForm(formData, receiptValidationRules);
    
    // Validate items if any exist
    if (items.length > 0) {
      items.forEach((item, index) => {
        const itemErrors = validateForm(item, itemValidationRules);
        Object.keys(itemErrors).forEach((field) => {
          formErrors[`item_${index}_${field}`] = itemErrors[field];
        });
      });
    }
    
    setErrors(formErrors);
    return Object.keys(formErrors).length === 0;
  };

  // Save functionality
  const handleSave = async (isAutoSave = false) => {
    if (!validateFormData()) {
      if (!isAutoSave) {
        Alert.alert('Validation Error', 'Please fix the errors before saving.');
      }
      return;
    }

    setIsSaving(true);
    
    try {
      // Update amount based on items if items exist
      const updatedReceipt: Receipt = {
        ...formData,
        amount: items.length > 0 ? calculateTotal() : formData.amount,
        notes: items.length > 0 ? JSON.stringify(items) : formData.notes,
        updatedAt: new Date().toISOString(),
      };
      
      onSave(updatedReceipt);
      setIsDirty(false);
      
      if (!isAutoSave) {
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (error) {
      if (!isAutoSave) {
        Alert.alert('Error', 'Failed to save receipt. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Undo/Redo functionality
  const handleUndo = () => {
    if (historyIndex.current > 0) {
      historyIndex.current--;
      const change = editHistory[historyIndex.current];
      setFormData((prev) => ({ ...prev, [change.field]: change.oldValue }));
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleRedo = () => {
    if (historyIndex.current < editHistory.length - 1) {
      historyIndex.current++;
      const change = editHistory[historyIndex.current];
      setFormData((prev) => ({ ...prev, [change.field]: change.newValue }));
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  // Cancel with confirmation
  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: onCancel,
          },
        ]
      );
    } else {
      onCancel();
    }
  };

  // Render item row
  const renderItem = ({ item, index }: { item: ReceiptItem; index: number }) => (
    <View style={[styles.itemRow, { borderColor: theme.colors.card.border }]}>
      <View style={styles.itemInputContainer}>
        <TextInput
          style={[
            styles.itemNameInput,
            { 
              backgroundColor: theme.colors.surfaceLight,
              color: theme.colors.text.primary,
            },
            errors[`item_${index}_name`] && styles.inputError,
          ]}
          placeholder="Item name"
          placeholderTextColor={theme.colors.text.tertiary}
          value={item.name}
          onChangeText={(value) => updateItem(item.id, 'name', value)}
        />
        {errors[`item_${index}_name`] && (
          <Text style={[styles.errorText, { color: theme.colors.accent.error }]}>
            {errors[`item_${index}_name`]}
          </Text>
        )}
      </View>
      
      <View style={styles.itemNumberContainer}>
        <TextInput
          style={[
            styles.itemNumberInput,
            { 
              backgroundColor: theme.colors.surfaceLight,
              color: theme.colors.text.primary,
            },
            errors[`item_${index}_quantity`] && styles.inputError,
          ]}
          placeholder="Qty"
          placeholderTextColor={theme.colors.text.tertiary}
          value={item.quantity.toString()}
          onChangeText={(value) => updateItem(item.id, 'quantity', parseInt(value) || 0)}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.itemNumberContainer}>
        <TextInput
          style={[
            styles.itemNumberInput,
            { 
              backgroundColor: theme.colors.surfaceLight,
              color: theme.colors.text.primary,
            },
            errors[`item_${index}_price`] && styles.inputError,
          ]}
          placeholder="Price"
          placeholderTextColor={theme.colors.text.tertiary}
          value={item.price.toString()}
          onChangeText={(value) => updateItem(item.id, 'price', parseFloat(formatCurrency(value)) || 0)}
          keyboardType="decimal-pad"
        />
      </View>
      
      <TouchableOpacity
        style={styles.removeItemButton}
        onPress={() => removeItem(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={theme.colors.accent.error} />
      </TouchableOpacity>
    </View>
  );

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
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 12,
    },
    undoRedoButton: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.surfaceLight,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    inputContainer: {
      paddingHorizontal: 16,
      marginTop: 12,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginBottom: 8,
    },
    requiredIndicator: {
      color: theme.colors.accent.error,
    },
    input: {
      height: 48,
      borderRadius: 8,
      paddingHorizontal: 16,
      fontSize: 16,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    inputError: {
      borderColor: theme.colors.accent.error,
    },
    errorText: {
      fontSize: 12,
      marginTop: 4,
    },
    dateButton: {
      height: 48,
      borderRadius: 8,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    dateText: {
      fontSize: 16,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      marginTop: 12,
      gap: 8,
    },
    categoryButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    categoryButtonSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '500',
    },
    categoryTextSelected: {
      color: 'white',
    },
    itemsSection: {
      paddingHorizontal: 16,
    },
    itemsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    addItemButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    addItemText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 4,
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      gap: 8,
    },
    itemInputContainer: {
      flex: 1,
    },
    itemNameInput: {
      height: 40,
      borderRadius: 6,
      paddingHorizontal: 12,
      fontSize: 14,
    },
    itemNumberContainer: {
      width: 60,
    },
    itemNumberInput: {
      height: 40,
      borderRadius: 6,
      paddingHorizontal: 8,
      fontSize: 14,
      textAlign: 'center',
    },
    removeItemButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surfaceLight,
      marginTop: 8,
      borderRadius: 8,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    totalAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.primary,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.card.border,
      gap: 12,
      ...theme.shadows.sm,
    },
    footerButton: {
      flex: 1,
      height: 48,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceLight,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButtonText: {
      color: theme.colors.text.primary,
    },
    saveButtonText: {
      color: 'white',
    },
    savingIndicator: {
      position: 'absolute',
      top: 16,
      right: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      ...theme.shadows.sm,
    },
    savingText: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginLeft: 6,
    },
    categoryModal: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    categoryModalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      paddingBottom: 40,
      maxHeight: '50%',
    },
    categoryModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    categoryModalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    categoryList: {
      paddingHorizontal: 20,
    },
    categoryOption: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    categoryOptionText: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Edit Receipt</Text>
        <View style={styles.headerActions}>
          {showUndoRedo && (
            <>
              <TouchableOpacity
                style={[styles.undoRedoButton, { opacity: historyIndex.current > 0 ? 1 : 0.3 }]}
                onPress={handleUndo}
                disabled={historyIndex.current <= 0}
              >
                <Ionicons name="arrow-undo" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.undoRedoButton, { opacity: historyIndex.current < editHistory.length - 1 ? 1 : 0.3 }]}
                onPress={handleRedo}
                disabled={historyIndex.current >= editHistory.length - 1}
              >
                <Ionicons name="arrow-redo" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Auto-save indicator */}
      {isSaving && autoSave && (
        <View style={styles.savingIndicator}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.savingText}>Saving...</Text>
        </View>
      )}

      {/* Form Content */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>
          
          {/* Merchant Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Merchant Name <Text style={styles.requiredIndicator}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text.primary,
                },
                errors.merchant && styles.inputError,
              ]}
              value={formData.merchant}
              onChangeText={(value) => handleFieldChange('merchant', value)}
              placeholder="Enter merchant name"
              placeholderTextColor={theme.colors.text.tertiary}
            />
            {errors.merchant && (
              <Text style={[styles.errorText, { color: theme.colors.accent.error }]}>
                {errors.merchant}
              </Text>
            )}
          </View>
          
          {/* Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Date <Text style={styles.requiredIndicator}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                { backgroundColor: theme.colors.surface },
                errors.date && styles.inputError,
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, { color: theme.colors.text.primary }]}>
                {new Date(formData.date).toLocaleDateString()}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
            {errors.date && (
              <Text style={[styles.errorText, { color: theme.colors.accent.error }]}>
                {errors.date}
              </Text>
            )}
          </View>
          
          {/* Amount */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Amount <Text style={styles.requiredIndicator}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text.primary,
                },
                errors.amount && styles.inputError,
              ]}
              value={formData.amount.toString()}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="decimal-pad"
            />
            {errors.amount && (
              <Text style={[styles.errorText, { color: theme.colors.accent.error }]}>
                {errors.amount}
              </Text>
            )}
          </View>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Category</Text>
          </View>
          <View style={styles.categoryGrid}>
            {categoryOptions.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  { backgroundColor: theme.colors.surface },
                  formData.category === category && styles.categoryButtonSelected,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: theme.colors.text.primary },
                    formData.category === category && styles.categoryTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && (
            <Text style={[styles.errorText, { color: theme.colors.accent.error, marginLeft: 16 }]}>
              {errors.category}
            </Text>
          )}
        </View>

        {/* Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
          </View>
          <View style={styles.itemsSection}>
            <View style={styles.itemsHeader}>
              <Text style={[styles.label, { marginBottom: 0 }]}>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
                <Ionicons name="add" size={18} color="white" />
                <Text style={styles.addItemText}>Add Item</Text>
              </TouchableOpacity>
            </View>
            
            {items.map((item, index) => (
              <View key={item.id}>
                {renderItem({ item, index })}
              </View>
            ))}
            
            {items.length > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>
                  ${calculateTotal().toFixed(2)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
          </View>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text.primary,
                  height: 100,
                  textAlignVertical: 'top',
                  paddingTop: 12,
                },
              ]}
              value={items.length === 0 ? formData.notes : ''}
              onChangeText={(value) => handleFieldChange('notes', value)}
              placeholder="Add any additional notes..."
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              editable={items.length === 0}
            />
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.footerButton, styles.cancelButton]}
          onPress={handleCancel}
        >
          <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.footerButton, styles.saveButton]}
          onPress={() => handleSave(false)}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="white" />
              <Text style={[styles.buttonText, styles.saveButtonText]}>Save</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={parseDate(formData.date)}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={handleDateChange}
        />
      )}

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity
          style={styles.categoryModal}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.categoryModalContent}>
            <View style={styles.categoryModalHeader}>
              <Text style={styles.categoryModalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={categoryOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryOption}
                  onPress={() => handleCategorySelect(item)}
                >
                  <Text style={styles.categoryOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
              style={styles.categoryList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

export default ReceiptEditForm;