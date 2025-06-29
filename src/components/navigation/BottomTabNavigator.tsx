import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

// Import screens
import HomeScreen from '../../screens/HomeScreen';
import CameraScreen from '../../screens/CameraScreen';
import SearchScreen from '../../screens/SearchScreen';
import ErrorBoundary from '../ErrorBoundary';

// Get device dimensions
const { width: screenWidth } = Dimensions.get('window');
const isTablet = screenWidth > 768;

// Create tab navigator
const Tab = createBottomTabNavigator();

// Wrapped Camera Screen with Error Boundary
const CameraScreenWithErrorBoundary = () => (
  <ErrorBoundary>
    <CameraScreen />
  </ErrorBoundary>
);

// Tab icon mapping
const TAB_ICONS = {
  Home: { active: 'home', inactive: 'home-outline' },
  Camera: { active: 'scan', inactive: 'scan-outline' },
  Search: { active: 'search', inactive: 'search-outline' },
} as const;

// Custom tab bar button component
interface TabBarButtonProps {
  children: (props: { isHovered: boolean }) => React.ReactNode;
  onPress: () => void;
  accessibilityState?: { selected?: boolean };
  isCamera?: boolean;
}

const TabBarButton: React.FC<TabBarButtonProps> = ({
  children,
  onPress,
  accessibilityState,
  isCamera = false,
}) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = React.useState(false);
  const isSelected = accessibilityState?.selected || false;

  useEffect(() => {
    if (isSelected) {
      // Animate scale when selected
      Animated.spring(scaleAnim, {
        toValue: 1.1,
        useNativeDriver: true,
        tension: 50,
        friction: 5,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 5,
      }).start();
    }
  }, [isSelected]);

  const handlePress = () => {
    // Haptic feedback on tab press
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: isSelected ? 1.1 : 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.tabButton,
        isCamera && styles.cameraTabButton,
      ]}
      onMouseEnter={() => Platform.OS === 'web' && setIsHovered(true)}
      onMouseLeave={() => Platform.OS === 'web' && setIsHovered(false)}
    >
      <Animated.View
        style={[
          styles.tabButtonContent,
          isCamera && styles.cameraButtonContent,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {children({ isHovered })}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Custom tab bar component
const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation }) => {
  const { theme, themeMode } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  return (
    <View style={[styles.tabBarContainer, { backgroundColor: theme.colors.background }]}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={80} tint={themeMode === "dark" ? "dark" : "light"} style={[styles.tabBarBlur, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.card.border }]}>
          <View style={styles.tabBar}>
            {state.routes.map((route: any, index: number) => {
              const { options } = descriptors[route.key];
              const label = options.tabBarLabel ?? options.title ?? route.name;
              const isFocused = state.index === index;
              const isCamera = route.name === 'Camera';

              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const iconName = isFocused
                ? TAB_ICONS[route.name as keyof typeof TAB_ICONS].active
                : TAB_ICONS[route.name as keyof typeof TAB_ICONS].inactive;

              return (
                <TabBarButton
                  key={route.name}
                  onPress={onPress}
                  accessibilityState={{ selected: isFocused }}
                  isCamera={isCamera}
                >
                  {({ isHovered }) => (
                    <>
                      <Ionicons
                        name={iconName as any}
                        size={isCamera ? 30 : 24}
                        color={isCamera ? '#FFFFFF' : (isFocused ? theme.colors.text.primary : theme.colors.text.secondary)}
                      />
                      {Platform.OS === 'android' && (
                        <Text
                          style={[
                            styles.tabLabel,
                            { color: isFocused ? theme.colors.text.primary : theme.colors.text.secondary },
                          ]}
                        >
                          {label}
                        </Text>
                      )}
                    </>
                  )}
                </TabBarButton>
              );
            })}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.tabBar, styles.tabBarAndroid]}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label = options.tabBarLabel ?? options.title ?? route.name;
            const isFocused = state.index === index;
            const isCamera = route.name === 'Camera';

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const iconName = isFocused
              ? TAB_ICONS[route.name as keyof typeof TAB_ICONS].active
              : TAB_ICONS[route.name as keyof typeof TAB_ICONS].inactive;

            return (
              <TabBarButton
                key={route.name}
                onPress={onPress}
                accessibilityState={{ selected: isFocused }}
                isCamera={isCamera}
              >
                {({ isHovered }) => (
                  <View style={styles.tabItemContent}>
                    <Ionicons
                      name={iconName as any}
                      size={isCamera ? 30 : 24}
                      color={isCamera ? theme.colors.text.primary : (isFocused ? theme.colors.text.primary : theme.colors.text.secondary)}
                    />
                    {(Platform.OS === 'android' || Platform.OS === 'web') && (
                      <Text
                        style={[
                          styles.tabLabel,
                          { color: isFocused ? theme.colors.text.primary : theme.colors.text.secondary },
                          Platform.OS === 'web' && !isFocused && !isHovered && styles.webLabelHidden,
                        ]}
                      >
                        {label}
                      </Text>
                    )}
                  </View>
                )}
              </TabBarButton>
            );
          })}
        </View>
      )}
    </View>
  );
};

// Bottom Tab Navigator component
const BottomTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home Tab',
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreenWithErrorBoundary}
        options={{
          tabBarLabel: 'Camera',
          tabBarAccessibilityLabel: 'Camera Tab',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarAccessibilityLabel: 'Search Tab',
        }}
      />
    </Tab.Navigator>
  );
};

const createStyles = (theme: typeof import('../../styles/theme').theme) => StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabBarBlur: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.card.border,
    backgroundColor: theme.colors.surface,
  },
  tabBar: {
    flexDirection: 'row',
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 8,
    paddingHorizontal: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'transparent',
    height: 83,
  },
  tabBarAndroid: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.card.border,
    elevation: 8,
    shadowColor: theme.colors.card.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  cameraTabButton: {
    marginHorizontal: 8,
  },
  tabButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonContent: {
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: theme.colors.card.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  tabItemContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '400',
  },
  webLabelHidden: {
    opacity: 0,
    ...(Platform.OS === 'web' && {
      transition: 'opacity 0.2s ease-in-out',
    }),
  },
});

export default BottomTabNavigator;