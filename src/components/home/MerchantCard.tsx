import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface MerchantCardProps {
  merchantName: string;
  category: string;
  amount: string;
  date: string;
  logoUrl?: string;
  onPress?: () => void;
}

const MerchantCard: React.FC<MerchantCardProps> = ({
  merchantName,
  category,
  amount,
  date,
  logoUrl,
  onPress,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.card.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      ...theme.shadows.sm,
    },
    leftContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    logoContainer: {
      marginRight: theme.spacing.md,
    },
    logo: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceLight,
    },
    logoPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surfaceLight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoText: {
      ...theme.typography.h3,
      color: theme.colors.text.primary,
    },
    textContent: {
      flex: 1,
    },
    merchantName: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginBottom: theme.spacing.xs,
    },
    category: {
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
    },
    rightContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    amount: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      fontWeight: '600',
      marginRight: theme.spacing.sm,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.leftContent}>
        <View style={styles.logoContainer}>
          {logoUrl ? (
            <Image source={{ uri: logoUrl }} style={styles.logo} />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>{merchantName.charAt(0)}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.textContent}>
          <Text style={styles.merchantName}>{merchantName}</Text>
          <Text style={styles.category}>{category} • {date}</Text>
        </View>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={styles.amount}>{amount}</Text>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={theme.colors.text.tertiary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default MerchantCard;