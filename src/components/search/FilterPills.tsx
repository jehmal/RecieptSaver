import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { FilterState, categoryOptions } from '../../types/filters';

interface FilterPillsProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onAdvancedPress: () => void;
  advancedFilterCount: number;
}

const dateFilters = ['Today', 'This Week', 'This Month', 'All Time'];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const FilterPills: React.FC<FilterPillsProps> = ({
  filters,
  onFiltersChange,
  onAdvancedPress,
  advancedFilterCount,
}) => {
  const { theme } = useTheme();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  // Animation values for modal
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const allCategories = [...categoryOptions, ...filters.customCategories];

  const handleCategoryToggle = (category: string) => {
    const updatedCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({
      ...filters,
      categories: updatedCategories,
    });
  };

  const handleDateFilterSelect = (dateFilter: typeof filters.dateRange) => {
    onFiltersChange({
      ...filters,
      dateRange: dateFilter,
    });
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !allCategories.includes(newCategory.trim())) {
      onFiltersChange({
        ...filters,
        customCategories: [...filters.customCategories, newCategory.trim()],
      });
      setNewCategory('');
      setShowAddCategory(false);
    }
  };

  // Handle modal animation
  useEffect(() => {
    if (showAddCategory) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showAddCategory, slideAnim, backdropOpacity]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    row: {
      paddingVertical: 4,
    },
    scrollContent: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    pill: {
      height: 32,
      paddingHorizontal: 14,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    selectedPill: {
      backgroundColor: theme.colors.text.primary,
      borderColor: theme.colors.text.primary,
    },
    pillText: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text.primary,
      ...Platform.select({
        ios: {
          fontFamily: 'System',
        },
        android: {
          fontFamily: 'Roboto',
        },
      }),
    },
    selectedPillText: {
      color: theme.colors.background,
    },
    addButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    advancedButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      height: 32,
      backgroundColor: theme.colors.accent.primary,
      borderRadius: 16,
    },
    advancedButtonText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },
    badge: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      minWidth: 20,
      alignItems: 'center',
    },
    badgeText: {
      color: theme.colors.accent.primary,
      fontSize: 11,
      fontWeight: '700',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    dragIndicator: {
      width: 36,
      height: 5,
      backgroundColor: '#C7C7CC',
      borderRadius: 2.5,
      alignSelf: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
      marginBottom: 24,
      letterSpacing: -0.5,
    },
    modalContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    input: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 17,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
      marginBottom: 24,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceLight,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    addButtonModal: {
      backgroundColor: theme.colors.accent.primary,
    },
    cancelButtonText: {
      color: theme.colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    addButtonModalText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Row 1: Categories */}
      <View style={styles.row}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {allCategories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => handleCategoryToggle(category)}
              style={[
                styles.pill,
                filters.categories.includes(category) && styles.selectedPill,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  filters.categories.includes(category) && styles.selectedPillText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            onPress={() => setShowAddCategory(true)}
            style={styles.addButton}
          >
            <Ionicons
              name="add"
              size={20}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {/* Row 2: Date Range + Advanced Filters */}
      <View style={styles.row}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {dateFilters.map((dateFilter) => (
            <TouchableOpacity
              key={dateFilter}
              onPress={() => handleDateFilterSelect(dateFilter as any)}
              style={[
                styles.pill,
                filters.dateRange === dateFilter && styles.selectedPill,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  filters.dateRange === dateFilter && styles.selectedPillText,
                ]}
              >
                {dateFilter}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            onPress={onAdvancedPress}
            style={styles.advancedButton}
          >
            <Ionicons name="filter" size={16} color="#FFFFFF" />
            <Text style={styles.advancedButtonText}>Advanced</Text>
            {advancedFilterCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{advancedFilterCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Add Category Modal */}
      <Modal
        transparent
        visible={showAddCategory}
        animationType="none"
        onRequestClose={() => setShowAddCategory(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAddCategory(false)}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdropOpacity,
              },
            ]}
          />
        </TouchableWithoutFeedback>
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.dragIndicator} />
            
            <Text style={styles.modalTitle}>Add Custom Category</Text>
            
            <View style={styles.modalContent}>
              <TextInput
                style={styles.input}
                value={newCategory}
                onChangeText={setNewCategory}
                placeholder="Enter category name"
                placeholderTextColor={theme.colors.text.tertiary}
                autoFocus
                onSubmitEditing={handleAddCategory}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setNewCategory('');
                    setShowAddCategory(false);
                  }}
                  style={[styles.modalButton, styles.cancelButton]}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={handleAddCategory}
                  style={[styles.modalButton, styles.addButtonModal]}
                >
                  <Text style={styles.addButtonModalText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};