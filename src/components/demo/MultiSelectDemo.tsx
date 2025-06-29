import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const MultiSelectDemo: React.FC = () => {
  const { theme } = useTheme();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const demoItems = [
    { id: '1', title: 'Starbucks', amount: '$5.45', date: 'Today' },
    { id: '2', title: 'Target', amount: '$89.23', date: 'Yesterday' },
    { id: '3', title: 'Whole Foods', amount: '$127.84', date: '2 days ago' },
    { id: '4', title: 'Amazon', amount: '$156.42', date: '3 days ago' },
    { id: '5', title: 'Shell', amount: '$52.47', date: '4 days ago' },
  ];

  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBulkAction = (action: string) => {
    Alert.alert(
      `${action} ${selectedItems.size} items`,
      `This would ${action.toLowerCase()} the selected receipts in a real app.`,
      [{ text: 'OK' }]
    );
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
      padding: 16,
      backgroundColor: theme.colors.card.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    modeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.colors.accent.primary,
      borderRadius: 16,
    },
    modeButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    itemSelected: {
      backgroundColor: theme.colors.surfaceLight,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.text.tertiary,
      marginRight: 12,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: theme.colors.accent.primary,
      borderColor: theme.colors.accent.primary,
    },
    itemContent: {
      flex: 1,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    itemSubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: 2,
    },
    itemAmount: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    actionBar: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 12,
      backgroundColor: theme.colors.card.background,
      borderTopWidth: 1,
      borderTopColor: theme.colors.card.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isSelectionMode ? `${selectedItems.size} Selected` : 'Multi-Select Demo'}
        </Text>
        <TouchableOpacity
          style={styles.modeButton}
          onPress={() => {
            setIsSelectionMode(!isSelectionMode);
            if (!isSelectionMode) {
              setSelectedItems(new Set());
            }
          }}
        >
          <Text style={styles.modeButtonText}>
            {isSelectionMode ? 'Cancel' : 'Select'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        {demoItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.item,
              selectedItems.has(item.id) && styles.itemSelected,
            ]}
            onPress={() => {
              if (isSelectionMode) {
                toggleSelection(item.id);
              } else {
                Alert.alert('Item Clicked', `You clicked on ${item.title}`);
              }
            }}
            activeOpacity={0.7}
          >
            {isSelectionMode && (
              <View
                style={[
                  styles.checkbox,
                  selectedItems.has(item.id) && styles.checkboxSelected,
                ]}
              >
                {selectedItems.has(item.id) && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            )}
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemSubtitle}>{item.date}</Text>
            </View>
            <Text style={styles.itemAmount}>{item.amount}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isSelectionMode && selectedItems.size > 0 && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleBulkAction('Categorize')}
          >
            <Ionicons name="pricetag" size={20} color={theme.colors.accent.primary} />
            <Text style={styles.actionText}>Categorize</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleBulkAction('Export')}
          >
            <Ionicons name="share-outline" size={20} color="#34C759" />
            <Text style={styles.actionText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleBulkAction('Delete')}
          >
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            <Text style={[styles.actionText, { color: '#FF3B30' }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MultiSelectDemo;