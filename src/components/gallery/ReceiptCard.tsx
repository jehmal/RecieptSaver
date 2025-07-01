import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Platform-specific imports
let Haptics: any = null;
if (Platform.OS !== 'web') {
  Haptics = require('expo-haptics');
}
import { format, parseISO, isValid, isToday, isYesterday } from 'date-fns';

// Import Receipt type from context
import { Receipt } from '../../contexts/ReceiptContext';
import { formatCurrency } from '../../utils/receiptHelpers';
import { normalizeStyle, getAnimationConfig } from '../../utils';

interface ReceiptCardProps {
  receipt: Receipt;
  isSelected?: boolean;
  isMultiSelectMode?: boolean;
  onPress: (receipt: Receipt) => void;
  onLongPress: (receiptId: string) => void;
  cardWidth?: number;
}

type CardState = 'default' | 'selected' | 'syncing' | 'error';

const ReceiptCard: React.FC<ReceiptCardProps> = ({
  receipt,
  isSelected = false,
  isMultiSelectMode = false,
  onPress,
  onLongPress,
  cardWidth,
}) => {
  // State management
  const [cardState, setCardState] = useState<CardState>('default');
  const [imageError, setImageError] = useState(false);
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const syncRotation = useRef(new Animated.Value(0)).current;

  // Update card state based on props
  useEffect(() => {
    if (isSelected) {
      setCardState('selected');
    } else if (receipt.isSynced === false && cardState !== 'syncing') {
      setCardState('default');
    } else if (receipt.isSynced) {
      setCardState('default');
    }
  }, [isSelected, receipt.isSynced]);

  // Handle press animations
  const handlePressIn = () => {
    Animated.timing(scaleAnim, getAnimationConfig({
      toValue: 0.95,
      duration: 100,
    })).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, getAnimationConfig({
      toValue: 1,
      duration: 100,
    })).start();
  };

  // Handle press
  const handlePress = () => {
    if (Platform.OS !== 'web' && Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress(receipt);
  };

  // Handle long press
  const handleLongPressEvent = () => {
    if (Platform.OS !== 'web' && Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress(receipt.id);
  };

  // Sync animation
  useEffect(() => {
    if (cardState === 'syncing') {
      const rotationAnimation = Animated.loop(
        Animated.timing(syncRotation, getAnimationConfig({
          toValue: 1,
          duration: 1000,
        }))
      );
      rotationAnimation.start();
      
      return () => {
        rotationAnimation.stop();
        syncRotation.setValue(0);
      };
    }
  }, [cardState]);

  // Format amount with proper currency display
  const formatAmount = (amount: number | string | undefined | null) => {
    return formatCurrency(amount);
  };

  // Format date with proper error handling using date-fns
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No date';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        // Try parsing as regular Date if ISO parsing fails
        const fallbackDate = new Date(dateString);
        if (!isValid(fallbackDate)) return 'Invalid date';
        
        if (isToday(fallbackDate)) return 'Today';
        if (isYesterday(fallbackDate)) return 'Yesterday';
        
        const currentYear = new Date().getFullYear();
        const dateYear = fallbackDate.getFullYear();
        return format(fallbackDate, dateYear === currentYear ? 'MMM d' : 'MMM d, yyyy');
      }
      
      if (isToday(date)) return 'Today';
      if (isYesterday(date)) return 'Yesterday';
      
      const currentYear = new Date().getFullYear();
      const dateYear = date.getFullYear();
      return format(date, dateYear === currentYear ? 'MMM d' : 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date in ReceiptCard:', error);
      return 'Invalid date';
    }
  };

  // Get sync icon based on state
  const getSyncIcon = () => {
    switch (cardState) {
      case 'syncing':
        return (
          <Animated.View
            style={{
              transform: [{
                rotate: syncRotation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '360deg']
                })
              }]
            }}
          >
            <Ionicons name="sync" size={16} color="white" />
          </Animated.View>
        );
      case 'error':
        return <Ionicons name="alert-circle" size={16} color="white" />;
      default:
        return receipt.isSynced ? (
          <Ionicons name="checkmark-circle" size={16} color="white" />
        ) : (
          <Ionicons name="cloud-offline" size={16} color="white" />
        );
    }
  };

  // Get sync badge color
  const getSyncBadgeColor = () => {
    switch (cardState) {
      case 'syncing':
        return '#F59E0B'; // Warning color
      case 'error':
        return '#EF4444'; // Error color
      default:
        return receipt.isSynced ? '#10B981' : '#64748B'; // Success or secondary
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      onLongPress={handleLongPressEvent}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        cardWidth && { width: cardWidth },
      ]}
    >
      <Animated.View
        style={normalizeStyle([
          styles.card,
          isSelected && styles.cardSelected,
          cardState === 'error' && styles.cardError,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ])}
      >
        {/* Thumbnail Image */}
        <View style={styles.imageContainer}>
          {imageError ? (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="receipt" size={32} color="#CBD5E1" />
            </View>
          ) : (
            <Image
              source={{ uri: receipt.thumbnailUri }}
              style={styles.thumbnail}
              onError={() => setImageError(true)}
              resizeMode="cover"
            />
          )}
          
          {/* Sync Status Badge */}
          <View 
            style={normalizeStyle([
              styles.syncBadge,
              { backgroundColor: getSyncBadgeColor() }
            ])}
          >
            {getSyncIcon()}
          </View>

          {/* Multi-select Checkbox */}
          {isMultiSelectMode && (
            <View style={normalizeStyle([styles.checkbox, isSelected && styles.checkboxSelected])}>
              {isSelected && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          )}

          {/* Category Badge (if exists) */}
          {receipt.category && !isMultiSelectMode && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText} numberOfLines={1}>
                {receipt.category}
              </Text>
            </View>
          )}
        </View>

        {/* Receipt Information */}
        <View style={styles.infoContainer}>
          <Text style={styles.merchantName} numberOfLines={1}>
            {receipt.merchant}
          </Text>
          <Text style={styles.amount}>
            {formatAmount(receipt.amount)}
          </Text>
          <Text style={styles.date}>
            {formatDate(receipt.date)}
          </Text>
        </View>

        {/* Loading Overlay for Syncing State */}
        {cardState === 'syncing' && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#2563EB" />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  cardError: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FEF2F2',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  syncBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  checkbox: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  checkboxSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
  infoContainer: {
    padding: 12,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  date: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReceiptCard;