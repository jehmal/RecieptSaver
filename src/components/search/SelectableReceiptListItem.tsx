import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

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

interface SelectableReceiptListItemProps {
  receipt: Receipt;
  isSelected: boolean;
  isSelectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onSelectionToggle: () => void;
}

const SelectableReceiptListItem: React.FC<SelectableReceiptListItemProps> = ({
  receipt,
  isSelected,
  isSelectionMode,
  onPress,
  onLongPress,
  onSelectionToggle,
}) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const checkboxAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(checkboxAnim, {
      toValue: isSelectionMode ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSelectionMode]);

  const handlePress = () => {
    if (isSelectionMode) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      
      // Animate selection
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
      
      onSelectionToggle();
    } else {
      onPress();
    }
  };

  const handleLongPress = () => {
    if (!isSelectionMode) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onLongPress();
    }
  };

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
      backgroundColor: isSelected ? theme.colors.surfaceLight : theme.colors.background,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    checkboxContainer: {
      width: 24,
      marginRight: 12,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isSelected ? theme.colors.accent.primary : theme.colors.text.tertiary,
      backgroundColor: isSelected ? theme.colors.accent.primary : 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
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
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={styles.content} 
        activeOpacity={0.7}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={300}
      >
        {/* Animated Checkbox */}
        <Animated.View 
          style={[
            styles.checkboxContainer,
            {
              opacity: checkboxAnim,
              transform: [
                {
                  translateX: checkboxAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.checkbox}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
        </Animated.View>

        {/* Merchant Logo */}
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              transform: [
                {
                  translateX: checkboxAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -36],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.logoText}>{receipt.merchantLogo || '🏪'}</Text>
        </Animated.View>

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
          {receipt.tags.length > 0 && !isSelectionMode && (
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
    </Animated.View>
  );
};

export default SelectableReceiptListItem;