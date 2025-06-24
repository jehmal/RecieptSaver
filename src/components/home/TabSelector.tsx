import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface TabSelectorProps {
  selectedTab: 'personal' | 'business';
  onTabChange: (tab: 'personal' | 'business') => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ selectedTab, onTabChange }) => {
  const animatedValue = useRef(new Animated.Value(selectedTab === 'personal' ? 0 : 1)).current;
  const scalePersonal = useRef(new Animated.Value(selectedTab === 'personal' ? 1 : 0.95)).current;
  const scaleBusiness = useRef(new Animated.Value(selectedTab === 'business' ? 1 : 0.95)).current;

  useEffect(() => {
    // Animate to the selected tab
    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: selectedTab === 'personal' ? 0 : 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(scalePersonal, {
        toValue: selectedTab === 'personal' ? 1 : 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleBusiness, {
        toValue: selectedTab === 'business' ? 1 : 0.95,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedTab, animatedValue, scalePersonal, scaleBusiness]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (screenWidth - 40) / 2 - 2], // Half width minus padding and border
  });

  const handleTabPress = (tab: 'personal' | 'business') => {
    if (tab !== selectedTab) {
      // Add a subtle haptic feedback if available
      onTabChange(tab);
    }
  };

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
        
        {/* Personal Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress('personal')}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              transform: [{ scale: scalePersonal }],
            }}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'personal' ? styles.selectedText : styles.unselectedText,
              ]}
            >
              Personal
            </Text>
          </Animated.View>
        </TouchableOpacity>

        {/* Business Tab */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabPress('business')}
          activeOpacity={0.7}
        >
          <Animated.View
            style={{
              transform: [{ scale: scaleBusiness }],
            }}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'business' ? styles.selectedText : styles.unselectedText,
              ]}
            >
              Business
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    borderRadius: 26,
    padding: 2,
    position: 'relative',
    height: 52,
  },
  selectedPill: {
    position: 'absolute',
    width: '50%',
    height: 48,
    backgroundColor: '#1C1C1E',
    borderRadius: 24,
    top: 2,
    left: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 17,
    fontWeight: '500',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  unselectedText: {
    color: '#1C1C1E',
  },
});

export default TabSelector;