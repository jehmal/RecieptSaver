import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Share,
  Animated,
  Dimensions,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import { shareReceipt, exportReceiptAsPDF, shareReceiptAsText } from '../../utils/receiptExport';
import { Receipt } from '../../contexts/ReceiptContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface ReceiptData {
  id: string;
  merchantName: string;
  date: string;
  totalAmount: number;
  items: ReceiptItem[];
  category: string;
  tags: string[];
  imageUrl?: string;
}

interface ReceiptDetailModalProps {
  visible: boolean;
  onClose: () => void;
  receiptData: ReceiptData;
  onSave: (updatedData: ReceiptData) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Healthcare',
  'Entertainment',
  'Utilities',
  'Business',
  'Other',
];

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  visible,
  onClose,
  receiptData,
  onSave,
  onDelete,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<ReceiptData>(receiptData);
  const [newTag, setNewTag] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setEditedData(receiptData);
    setIsEditing(false);
  }, [receiptData]);

  const handleSave = () => {
    // Validate data
    if (!editedData.merchantName.trim()) {
      Alert.alert('Error', 'Merchant name is required');
      return;
    }
    if (editedData.totalAmount <= 0) {
      Alert.alert('Error', 'Total amount must be greater than 0');
      return;
    }

    onSave(editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'Keep Editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            setEditedData(receiptData);
            setIsEditing(false);
          },
        },
      ],
    );
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
            onDelete(receiptData.id);
            onClose();
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    // Convert the modal's receipt data format to the standard Receipt format
    const receiptForSharing: Receipt = {
      id: editedData.id,
      merchant: editedData.merchantName,
      amount: editedData.totalAmount,
      date: editedData.date,
      category: editedData.category,
      tags: editedData.tags,
      imageUri: editedData.imageUrl || '',
      isSynced: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Alert.alert('Share Receipt', 'Choose share format', [
      { 
        text: 'Share as PDF', 
        onPress: async () => {
          try {
            await shareReceipt(receiptForSharing, { format: 'pdf' });
          } catch (error) {
            Alert.alert('Error', 'Failed to share receipt as PDF');
          }
        }
      },
      { 
        text: 'Share as Image', 
        onPress: async () => {
          try {
            if (editedData.imageUrl) {
              await shareReceipt(receiptForSharing, { format: 'image' });
            } else {
              Alert.alert('Error', 'No receipt image available to share');
            }
          } catch (error) {
            Alert.alert('Error', 'Failed to share receipt image');
          }
        }
      },
      { 
        text: 'Share as Text', 
        onPress: async () => {
          try {
            await shareReceiptAsText(receiptForSharing);
          } catch (error) {
            Alert.alert('Error', 'Failed to share receipt as text');
          }
        }
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const addItem = () => {
    const newItem: ReceiptItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0,
    };
    setEditedData({
      ...editedData,
      items: [...editedData.items, newItem],
    });
  };

  const updateItem = (id: string, field: keyof ReceiptItem, value: any) => {
    setEditedData({
      ...editedData,
      items: editedData.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  };

  const removeItem = (id: string) => {
    setEditedData({
      ...editedData,
      items: editedData.items.filter((item) => item.id !== id),
    });
  };

  const addTag = () => {
    if (newTag.trim() && !editedData.tags.includes(newTag.trim())) {
      setEditedData({
        ...editedData,
        tags: [...editedData.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setEditedData({
      ...editedData,
      tags: editedData.tags.filter((t) => t !== tag),
    });
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Ionicons name="close" size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>
      
      <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
        Receipt Details
      </Text>
      
      <View style={styles.headerActions}>
        {!isEditing ? (
          <>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons name="share-outline" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.headerButton}>
              <Ionicons name="create-outline" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: theme.colors.text.secondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: theme.colors.accent.primary }]}>
                Save
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderReceiptImage = () => {
    if (!editedData.imageUrl) return null;

    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: editedData.imageUrl }}
          style={styles.receiptImage}
          resizeMode="contain"
        />
      </View>
    );
  };

  const renderField = (label: string, value: string, field: keyof ReceiptData) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>
        {label}
      </Text>
      {isEditing ? (
        <TextInput
          style={[
            styles.fieldInput,
            {
              backgroundColor: theme.colors.card.background,
              color: theme.colors.text.primary,
              borderColor: theme.colors.card.border,
            },
          ]}
          value={value}
          onChangeText={(text) => setEditedData({ ...editedData, [field]: text })}
          placeholder={`Enter ${label.toLowerCase()}`}
          placeholderTextColor={theme.colors.text.tertiary}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>
          {value}
        </Text>
      )}
    </View>
  );

  const renderAmountField = () => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>
        Total Amount
      </Text>
      {isEditing ? (
        <TextInput
          style={[
            styles.fieldInput,
            {
              backgroundColor: theme.colors.card.background,
              color: theme.colors.text.primary,
              borderColor: theme.colors.card.border,
            },
          ]}
          value={editedData.totalAmount.toString()}
          onChangeText={(text) => {
            const amount = parseFloat(text) || 0;
            setEditedData({ ...editedData, totalAmount: amount });
          }}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      ) : (
        <Text style={[styles.fieldValue, { color: theme.colors.text.primary }]}>
          ${editedData.totalAmount.toFixed(2)}
        </Text>
      )}
    </View>
  );

  const renderCategory = () => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.colors.text.secondary }]}>
        Category
      </Text>
      {isEditing ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setEditedData({ ...editedData, category })}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    editedData.category === category
                      ? theme.colors.accent.primary
                      : theme.colors.card.background,
                  borderColor: theme.colors.card.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color:
                      editedData.category === category
                        ? '#FFFFFF'
                        : theme.colors.text.primary,
                  },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.categoryDisplay,
            {
              backgroundColor: theme.colors.accent.primary + '20',
            },
          ]}
        >
          <Text style={[styles.categoryDisplayText, { color: theme.colors.accent.primary }]}>
            {editedData.category}
          </Text>
        </View>
      )}
    </View>
  );

  const renderItems = () => (
    <View style={styles.itemsSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Items
        </Text>
        {isEditing && (
          <TouchableOpacity onPress={addItem}>
            <Ionicons name="add-circle-outline" size={24} color={theme.colors.accent.primary} />
          </TouchableOpacity>
        )}
      </View>
      
      {editedData.items.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.itemRow,
            {
              backgroundColor: theme.colors.card.background,
              borderColor: theme.colors.card.border,
            },
          ]}
        >
          {isEditing ? (
            <>
              <TextInput
                style={[
                  styles.itemNameInput,
                  { color: theme.colors.text.primary },
                ]}
                value={item.name}
                onChangeText={(text) => updateItem(item.id, 'name', text)}
                placeholder="Item name"
                placeholderTextColor={theme.colors.text.tertiary}
              />
              <TextInput
                style={[
                  styles.itemQuantityInput,
                  { color: theme.colors.text.primary },
                ]}
                value={item.quantity.toString()}
                onChangeText={(text) => updateItem(item.id, 'quantity', parseInt(text) || 0)}
                keyboardType="number-pad"
                placeholder="Qty"
                placeholderTextColor={theme.colors.text.tertiary}
              />
              <TextInput
                style={[
                  styles.itemPriceInput,
                  { color: theme.colors.text.primary },
                ]}
                value={item.price.toString()}
                onChangeText={(text) => updateItem(item.id, 'price', parseFloat(text) || 0)}
                keyboardType="decimal-pad"
                placeholder="Price"
                placeholderTextColor={theme.colors.text.tertiary}
              />
              <TouchableOpacity onPress={() => removeItem(item.id)}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.accent.error} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={[styles.itemName, { color: theme.colors.text.primary }]}>
                {item.name || 'Unnamed item'}
              </Text>
              <Text style={[styles.itemDetails, { color: theme.colors.text.secondary }]}>
                {item.quantity} x ${item.price.toFixed(2)}
              </Text>
              <Text style={[styles.itemTotal, { color: theme.colors.text.primary }]}>
                ${(item.quantity * item.price).toFixed(2)}
              </Text>
            </>
          )}
        </View>
      ))}
    </View>
  );

  const renderTags = () => (
    <View style={styles.tagsSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Tags
      </Text>
      
      <View style={styles.tagsContainer}>
        {editedData.tags.map((tag) => (
          <View
            key={tag}
            style={[
              styles.tag,
              {
                backgroundColor: theme.colors.accent.primary + '20',
              },
            ]}
          >
            <Text style={[styles.tagText, { color: theme.colors.accent.primary }]}>
              {tag}
            </Text>
            {isEditing && (
              <TouchableOpacity onPress={() => removeTag(tag)} style={styles.tagRemove}>
                <Ionicons name="close-circle" size={16} color={theme.colors.accent.primary} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {isEditing && (
          <View style={styles.addTagContainer}>
            <TextInput
              style={[
                styles.addTagInput,
                {
                  backgroundColor: theme.colors.card.background,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.card.border,
                },
              ]}
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={addTag}
              placeholder="Add tag"
              placeholderTextColor={theme.colors.text.tertiary}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={addTag} style={styles.addTagButton}>
              <Ionicons name="add" size={20} color={theme.colors.accent.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      propagateSwipe
      avoidKeyboard
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          styles.modalContent,
          {
            backgroundColor: theme.colors.background,
            paddingBottom: insets.bottom || 20,
          },
        ]}
      >
        {renderHeader()}
        
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {renderReceiptImage()}
          
          <View style={styles.detailsContainer}>
            {renderField('Merchant', editedData.merchantName, 'merchantName')}
            {renderField('Date', editedData.date, 'date')}
            {renderAmountField()}
            {renderCategory()}
            {renderItems()}
            {renderTags()}
            
            {!isEditing && (
              <TouchableOpacity
                onPress={handleDelete}
                style={[
                  styles.deleteButton,
                  {
                    backgroundColor: theme.colors.accent.error + '20',
                  },
                ]}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.accent.error} />
                <Text style={[styles.deleteButtonText, { color: theme.colors.accent.error }]}>
                  Delete Receipt
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 16,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    height: 300,
    marginBottom: 20,
  },
  receiptImage: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
  },
  fieldInput: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  categoryDisplayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  itemDetails: {
    fontSize: 14,
    marginRight: 16,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemNameInput: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  itemQuantityInput: {
    width: 40,
    fontSize: 14,
    marginRight: 8,
    textAlign: 'center',
  },
  itemPriceInput: {
    width: 60,
    fontSize: 14,
    marginRight: 8,
    textAlign: 'right',
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagRemove: {
    marginLeft: 4,
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTagInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  addTagButton: {
    padding: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});