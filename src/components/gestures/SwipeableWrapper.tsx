import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SwipeableWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper component to ensure swipeable items don't overflow the viewport
 * This prevents action buttons from being positioned outside the screen bounds
 */
export const SwipeableWrapper: React.FC<SwipeableWrapperProps> = ({ children }) => {
  return (
    <View style={styles.wrapper}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    // Ensure the wrapper takes full width but doesn't exceed it
    width: '100%',
  },
});

export default SwipeableWrapper;