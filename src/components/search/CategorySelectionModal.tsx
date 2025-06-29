import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface CategorySelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCategory: (category: Category) => void;
  selectedCategoryId?: string;
}

const categories: Category[] = [
  { id: '1', name: 'Groceries', icon: 'cart', color: '#34C759' },
  { id: '2', name: 'Restaurants', icon: 'restaurant', color: '#FF9500' },
  { id: '3', name: 'Transportation', icon: 'car', color: '#007AFF' },
  { id: '4', name: 'Shopping', icon: 'bag-handle', color: '#AF52DE' },
  { id: '5', name: 'Entertainment', icon: 'film', color: '#FF3B30' },
  { id: '6', name: 'Healthcare', icon: 'medkit', color: '#FF2D55' },
  { id: '7', name: 'Travel', icon: 'airplane', color: '#5856D6' },
  { id: '8', name: 'Utilities', icon: 'flash', color: '#FFCC00' },
  { id: '9', name: 'Education', icon: 'school', color: '#00C7BE' },
  { id: '10', name: 'Other', icon: 'ellipsis-horizontal', color: '#8E8E93' },
];

const CategorySelectionModal: React.FC<CategorySelectionModalProps> = ({
  visible,
  onClose,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const { theme } = useTheme();

  const handleCategorySelect = (category: Category) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onSelectCategory(category);
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    container: {
      backgroundColor: theme.colors.card.background,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    closeButton: {
      padding: 4,
    },
    scrollContent: {
      padding: 12,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    categoryItem: {
      width: '48%',
      marginBottom: 12,
    },
    categoryButton: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    selectedCategory: {
      borderColor: theme.colors.accent.primary,
      backgroundColor: theme.colors.accent.primary + '10',
    },
    categoryIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    categoryName: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Select Category</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View style={styles.categoryGrid}>
                {categories.map((category) => (
                  <View key={category.id} style={styles.categoryItem}>
                    <TouchableOpacity
                      style={[
                        styles.categoryButton,
                        selectedCategoryId === category.id && styles.selectedCategory,
                      ]}
                      onPress={() => handleCategorySelect(category)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                        <Ionicons 
                          name={category.icon as any} 
                          size={24} 
                          color={category.color} 
                        />
                      </View>
                      <Text style={styles.categoryName}>{category.name}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default CategorySelectionModal;