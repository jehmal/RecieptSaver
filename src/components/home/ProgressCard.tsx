import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import CircularProgressRing from './CircularProgressRing';


interface ProgressCardProps {
  receiptCount: number;
  receiptGoal: number;
  budgetSpent: number;
  budgetTotal: number;
  onPress?: () => void;
}

const ProgressCard: React.FC<ProgressCardProps> = ({
  receiptCount,
  receiptGoal,
  budgetSpent,
  budgetTotal,
  onPress,
}) => {
  const { theme } = useTheme();
  const receiptsProgress = receiptCount / receiptGoal;
  const budgetProgress = budgetSpent / budgetTotal;

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    title: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
  });

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Spending Goals</Text>
        <Ionicons 
          name="chevron-forward" 
          size={24} 
          color={theme.colors.text.secondary} 
        />
      </View>
      
      <View style={styles.progressRow}>
        <CircularProgressRing
          progress={receiptsProgress}
          mainValue={receiptCount}
          subValue={`of ${receiptGoal}`}
          icon="receipt-outline"
        />
        <CircularProgressRing
          progress={budgetProgress}
          mainValue={formatCurrency(budgetSpent)}
          subValue={`of ${formatCurrency(budgetTotal)}`}
          icon="cash-outline"
        />
      </View>
    </TouchableOpacity>
  );
};

export default ProgressCard;