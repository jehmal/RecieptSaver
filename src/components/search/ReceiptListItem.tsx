import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Receipt {
  id: string;
  merchant: string;
  amount: number;
  date: Date;
  tags: Tag[];
  thumbnail?: string;
  category: string;
  paymentMethod: string;
  merchantLogo?: string;
  merchantColor?: string;
  description?: string;
}

interface ReceiptListItemProps {
  receipt: Receipt;
  onPress?: () => void;
}

const ReceiptListItem: React.FC<ReceiptListItemProps> = ({ receipt, onPress }) => {
  const { theme } = useTheme();
  
  // Format date in a concise way
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
    },
    logoContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: receipt.merchantColor || theme.colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    logoText: {
      fontSize: 20,
    },
    contentContainer: {
      flex: 1,
      marginRight: 12,
    },
    merchantName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    descriptionText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    dateText: {
      fontSize: 13,
      color: theme.colors.text.tertiary,
    },
    rightContainer: {
      alignItems: 'flex-end',
    },
    amount: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    tagContainer: {
      marginTop: 4,
    },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    tagText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Merchant Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>{receipt.merchantLogo || '🏪'}</Text>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        <Text style={styles.merchantName} numberOfLines={1}>
          {receipt.merchant}
        </Text>
        {receipt.description && (
          <Text style={styles.descriptionText} numberOfLines={1}>
            {receipt.description}
          </Text>
        )}
        <Text style={styles.dateText}>
          {formatDate(receipt.date)}
        </Text>
      </View>

      {/* Right Side */}
      <View style={styles.rightContainer}>
        <Text style={styles.amount}>
          ${receipt.amount.toFixed(2)}
        </Text>
        {receipt.tags.length > 0 && (
          <View style={styles.tagContainer}>
            <View style={[styles.tag, { backgroundColor: receipt.tags[0].color || theme.colors.accent.primary }]}>
              <Text style={styles.tagText}>
                {receipt.tags[0].name}
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ReceiptListItem;