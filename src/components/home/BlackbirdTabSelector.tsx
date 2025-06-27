import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface BlackbirdTabSelectorProps {
  selectedTab: 'receipts' | 'warranties';
  onTabChange: (tab: 'receipts' | 'warranties') => void;
}

const BlackbirdTabSelector: React.FC<BlackbirdTabSelectorProps> = ({ selectedTab, onTabChange }) => {
  const { theme } = useTheme();
  const animatedValue = useRef(new Animated.Value(selectedTab === 'receipts' ? 0 : 1)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: selectedTab === 'receipts' ? 0 : 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [selectedTab, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, (screenWidth - 48) / 2], // Half width minus padding
  });

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: theme.borderRadius.full,
      padding: 2,
      position: 'relative',
      height: 40,
    },
    selectedPill: {
      position: 'absolute',
      width: '50%',
      height: 36,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.full,
      top: 2,
      ...theme.shadows.sm,
    },
    tab: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    tabText: {
      ...theme.typography.body,
      fontWeight: '500',
    },
    selectedText: {
      color: theme.colors.text.primary,
    },
    unselectedText: {
      color: theme.colors.text.secondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {/* Animated background pill */}
        <Animated.View
          style={[
            styles.selectedPill,
            {
              transform: [{ translateX }],
            },
          ]}
        />
        
        {/* Receipts Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabChange('receipts')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'receipts' ? styles.selectedText : styles.unselectedText,
            ]}
          >
            Receipts
          </Text>
        </TouchableOpacity>

        {/* Warranties Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => onTabChange('warranties')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'warranties' ? styles.selectedText : styles.unselectedText,
            ]}
          >
            Warranties
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BlackbirdTabSelector;