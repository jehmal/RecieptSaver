import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface MonthlyTotalDisplayProps {
  amount: string;
  month: string;
  year: string;
  onPillPress?: () => void;
}

const MonthlyTotalDisplay: React.FC<MonthlyTotalDisplayProps> = ({
  amount,
  month,
  year,
  onPillPress,
}) => {
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      marginVertical: theme.spacing.xxl,
    },
    amountText: {
      ...theme.typography.largeNumber,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.lg,
    },
    pillButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.text.primary,
      height: 32,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.full,
    },
    pillText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.colors.background,
      marginLeft: theme.spacing.xs,
      letterSpacing: -0.08,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.amountText}>{amount}</Text>
      
      <TouchableOpacity
        style={styles.pillButton}
        onPress={onPillPress}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="receipt-outline" 
          size={16} 
          color={theme.colors.background} 
        />
        <Text style={styles.pillText}>
          {month} {year}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default MonthlyTotalDisplay;