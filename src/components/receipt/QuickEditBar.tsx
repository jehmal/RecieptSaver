import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/validation';

interface QuickEditBarProps {
  merchant: string;
  amount: number;
  category: string;
  onMerchantChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onCategoryPress: () => void;
  onEditPress: () => void;
}

const QuickEditBar: React.FC<QuickEditBarProps> = ({
  merchant,
  amount,
  category,
  onMerchantChange,
  onAmountChange,
  onCategoryPress,
  onEditPress,
}) => {
  const { theme } = useTheme();

  const handleEditPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onEditPress();
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.card.border,
      paddingHorizontal: 16,
      paddingVertical: 12,
      ...theme.shadows.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    label: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      width: 80,
      fontWeight: '500',
    },
    input: {
      flex: 1,
      height: 36,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 8,
      paddingHorizontal: 12,
      fontSize: 14,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    amountInput: {
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontWeight: '600',
    },
    categoryButton: {
      flex: 1,
      height: 36,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 8,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    categoryText: {
      fontSize: 14,
      color: theme.colors.text.primary,
    },
    fullEditButton: {
      marginTop: 8,
      height: 40,
      backgroundColor: theme.colors.primary,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    fullEditText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      {/* Merchant Row */}
      <View style={styles.row}>
        <Text style={styles.label}>Merchant</Text>
        <TextInput
          style={styles.input}
          value={merchant}
          onChangeText={onMerchantChange}
          placeholder="Enter merchant name"
          placeholderTextColor={theme.colors.text.tertiary}
        />
      </View>

      {/* Amount Row */}
      <View style={styles.row}>
        <Text style={styles.label}>Amount</Text>
        <TextInput
          style={[styles.input, styles.amountInput]}
          value={amount.toString()}
          onChangeText={(value) => onAmountChange(formatCurrency(value))}
          placeholder="0.00"
          placeholderTextColor={theme.colors.text.tertiary}
          keyboardType="decimal-pad"
        />
      </View>

      {/* Category Row */}
      <View style={styles.row}>
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.categoryButton} onPress={onCategoryPress}>
          <Text style={styles.categoryText}>{category || 'Select category'}</Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Full Edit Button */}
      <TouchableOpacity style={styles.fullEditButton} onPress={handleEditPress}>
        <Ionicons name="create-outline" size={18} color="white" />
        <Text style={styles.fullEditText}>Full Edit Mode</Text>
      </TouchableOpacity>
    </View>
  );
};

export default QuickEditBar;