import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AppearanceModalProps {
  visible: boolean;
  onClose: () => void;
}

type AppearanceOption = 'system' | 'light' | 'dark';

interface OptionItem {
  id: AppearanceOption;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const options: OptionItem[] = [
  { id: 'system', title: 'Device settings', icon: 'phone-portrait-outline' },
  { id: 'light', title: 'Light mode', icon: 'sunny-outline' },
  { id: 'dark', title: 'Dark mode', icon: 'moon-outline' },
];

export const AppearanceModal: React.FC<AppearanceModalProps> = ({ visible, onClose }) => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const insets = useSafeAreaInsets();
  const systemColorScheme = useColorScheme();
  
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropOpacity]);

  const handleOptionPress = (optionId: AppearanceOption) => {
    setThemeMode(optionId);
    // Don't close the modal - let user close it manually
  };

  const renderOption = (option: OptionItem) => {
    const isSelected = themeMode === option.id;
    
    return (
      <TouchableOpacity
        key={option.id}
        style={styles.optionContainer}
        onPress={() => handleOptionPress(option.id)}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <Ionicons
            name={option.icon}
            size={24}
            color={theme.colors.text.primary}
            style={styles.optionIcon}
          />
          <Text style={[styles.optionText, { color: theme.colors.text.primary }]}>
            {option.title}
          </Text>
        </View>
        <View style={[styles.radioButton, { borderColor: theme.colors.text.secondary }]}>
          {isSelected && (
            <View style={[styles.radioButtonFill, { backgroundColor: theme.colors.accent.primary }]} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropOpacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>
      
      <Animated.View
        style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: theme.colors.surface,
            paddingBottom: insets.bottom || 20,
          },
        ]}
      >
        <View style={styles.dragIndicator} />
        
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Appearance
        </Text>
        
        <View style={styles.optionsContainer}>
          {options.map(renderOption)}
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 12,
  },
  dragIndicator: {
    width: 36,
    height: 5,
    backgroundColor: '#C7C7CC',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: -0.5,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 16,
    width: 28,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '400',
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});