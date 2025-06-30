import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Warranty, calculateWarrantyStatus } from '../../types/warranty';

interface WarrantyListItemProps {
  warranty: Warranty;
  onPress?: () => void;
  onLongPress?: () => void;
}

const WarrantyListItem: React.FC<WarrantyListItemProps> = ({ warranty, onPress, onLongPress }) => {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Calculate warranty status
  const { daysRemaining, status } = calculateWarrantyStatus(warranty.expiryDate);
  
  // Get status color (similar to WarrantyCard logic)
  const getStatusColor = () => {
    if (status === 'expired') return '#8E8E93';
    if (daysRemaining <= 30) return '#FF3B30';
    if (daysRemaining <= 90) return '#FF9500';
    return '#34C759';
  };
  
  const statusColor = getStatusColor();
  
  // Format expiration info
  const formatExpirationInfo = () => {
    if (status === 'expired') return 'Expired';
    if (daysRemaining === 1) return 'Expires in 1 day';
    if (daysRemaining < 30) return `Expires in ${daysRemaining} days`;
    const months = Math.floor(daysRemaining / 30);
    if (months === 1) return 'Expires in 1 month';
    return `Expires in ${months} months`;
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.background, // Use theme background
    },
    logoContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)', // Subtle dark background
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.02)',
    },
    logoText: {
      fontSize: 20,
    },
    contentContainer: {
      flex: 1,
      marginRight: 12,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    subText: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginBottom: 2,
    },
    dateText: {
      fontSize: 13,
      color: statusColor,
      fontWeight: '500',
    },
    rightContainer: {
      alignItems: 'flex-end',
    },
    serialNumber: {
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
      backgroundColor: statusColor,
    },
    tagText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 40,
    }).start();
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      activeOpacity={0.7}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      delayLongPress={400}
    >
      <Animated.View 
        style={{ 
          transform: [{ scale: scaleAnim }],
          flexDirection: 'row',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {/* Warranty Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🛡️</Text>
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text style={styles.itemName} numberOfLines={1}>
            {warranty.itemName}
          </Text>
          {warranty.category && (
            <Text style={styles.subText} numberOfLines={1}>
              {warranty.category}
            </Text>
          )}
          <Text style={styles.dateText}>
            {formatExpirationInfo()}
          </Text>
        </View>

        {/* Right Side */}
        <View style={styles.rightContainer}>
          <Text style={styles.serialNumber}>
            {warranty.serialNumber}
          </Text>
          {daysRemaining <= 30 && daysRemaining > 0 && (
            <View style={styles.tagContainer}>
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {daysRemaining <= 7 ? 'Urgent' : 'Soon'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default WarrantyListItem;