import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ReceiptImageViewer,
  ReceiptInfoGrid,
  ReceiptTags,
  ActionButtons,
} from './index';
import { Tag } from './types';

interface ReceiptDetailExampleProps {
  visible: boolean;
  onClose: () => void;
  receipt: {
    id: string;
    merchantName: string;
    category: string;
    amount: string;
    date: string;
    time: string;
    paymentMethod: string;
    imageUri?: string;
  };
}

const ReceiptDetailExample: React.FC<ReceiptDetailExampleProps> = ({
  visible,
  onClose,
  receipt,
}) => {
  const insets = useSafeAreaInsets();
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', label: 'Business', isSelected: true },
    { id: '2', label: 'Tax Deductible', isSelected: false },
    { id: '3', label: 'Reimbursable', isSelected: false },
  ]);

  const handleTagPress = (tagId: string) => {
    setTags(prevTags =>
      prevTags.map(tag =>
        tag.id === tagId ? { ...tag, isSelected: !tag.isSelected } : tag
      )
    );
  };

  const handleAddTag = () => {
    Alert.alert('Add Tag', 'This would open a tag creation dialog');
  };

  const handleExport = () => {
    Alert.alert('Export Receipt', 'Choose export format', [
      { text: 'PDF', onPress: () => console.log('Export as PDF') },
      { text: 'Image', onPress: () => console.log('Export as Image') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleShare = () => {
    Alert.alert('Share Receipt', 'This would open the share sheet');
  };

  const handleMenu = () => {
    Alert.alert('More Options', 'Choose an action', [
      { text: 'Export PDF', onPress: () => console.log('Export PDF') },
      { text: 'Export Image', onPress: () => console.log('Export Image') },
      { text: 'Delete Receipt', onPress: () => console.log('Delete'), style: 'destructive' },
      { text: 'Report Issue', onPress: () => console.log('Report Issue') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color="#8E8E93" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleMenu}
              activeOpacity={0.7}
            >
              <Ionicons name="ellipsis-horizontal" size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Receipt Image */}
            <ReceiptImageViewer imageUri={receipt.imageUri} />

            {/* Merchant Info */}
            <View style={styles.merchantSection}>
              <Text style={styles.merchantName}>{receipt.merchantName}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{receipt.category}</Text>
              </View>
            </View>

            {/* Receipt Details Grid */}
            <ReceiptInfoGrid
              amount={receipt.amount}
              date={receipt.date}
              paymentMethod={receipt.paymentMethod}
              time={receipt.time}
            />

            {/* Tags */}
            <ReceiptTags
              tags={tags}
              onTagPress={handleTagPress}
              onAddTag={handleAddTag}
            />

            {/* Spacer for bottom buttons */}
            <View style={{ height: 180 }} />
          </ScrollView>

          {/* Action Buttons */}
          <ActionButtons onExport={handleExport} onShare={handleShare} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  merchantSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  merchantName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: 34,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  categoryText: {
    fontSize: 15,
    color: '#48484A',
    fontWeight: '500',
  },
});

export default ReceiptDetailExample;