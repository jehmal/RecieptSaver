import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  useColorScheme,
} from 'react-native';

interface ErrorModalProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  visible,
  message,
  onDismiss,
}) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim]);

  const modalStyles = [
    styles.modalContainer,
    isDarkMode && styles.modalContainerDark,
  ];

  const textStyles = [
    styles.errorText,
    isDarkMode && styles.errorTextDark,
  ];

  const buttonStyles = [
    styles.okButton,
    isDarkMode && styles.okButtonDark,
  ];

  const buttonTextStyles = [
    styles.okButtonText,
    isDarkMode && styles.okButtonTextDark,
  ];

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View 
        style={[
          styles.backdrop,
          { opacity: fadeAnim }
        ]}
      >
        <TouchableOpacity 
          style={styles.backdropTouchable} 
          activeOpacity={1} 
          onPress={onDismiss}
        >
          <Animated.View
            style={[
              modalStyles,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Text style={styles.exclamationMark}>!</Text>
                </View>
              </View>
              
              <Text style={styles.errorTitle}>Error</Text>
              
              <Text style={textStyles}>{message}</Text>
              
              <TouchableOpacity
                style={buttonStyles}
                onPress={onDismiss}
                activeOpacity={0.8}
              >
                <Text style={buttonTextStyles}>OK</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalContainerDark: {
    backgroundColor: '#2C2C2E',
  },
  iconContainer: {
    marginBottom: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exclamationMark: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#000',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    lineHeight: 22,
    color: '#333',
  },
  errorTextDark: {
    color: '#E5E5E7',
  },
  okButton: {
    backgroundColor: '#000',
    paddingHorizontal: 48,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  okButtonDark: {
    backgroundColor: '#FFF',
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  okButtonTextDark: {
    color: '#000',
  },
});