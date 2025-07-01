import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { 
  normalizePointerEvents, 
  getAnimationConfig,
  createTimingConfig,
  createSpringConfig,
} from '../../utils';

/**
 * Example component demonstrating React Native Web compatibility fixes
 * for pointerEvents and useNativeDriver warnings
 */
export const WebCompatibilityExample: React.FC = () => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isVisible, setIsVisible] = useState(true);

  // Example 1: Using getAnimationConfig for platform-aware animations
  const handleFadeToggle = () => {
    Animated.timing(fadeAnim, getAnimationConfig({
      toValue: isVisible ? 0 : 1,
      duration: 300,
    })).start(() => {
      setIsVisible(!isVisible);
    });
  };

  // Example 2: Using createTimingConfig helper
  const handleScale = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, createTimingConfig(200, {
        toValue: 1.2,
      })),
      Animated.timing(scaleAnim, createTimingConfig(200, {
        toValue: 1,
      })),
    ]).start();
  };

  // Example 3: Using createSpringConfig helper
  const handleSpring = () => {
    Animated.spring(scaleAnim, createSpringConfig(10, 50, {
      toValue: 1.5,
    })).start(() => {
      Animated.spring(scaleAnim, createSpringConfig(10, 50, {
        toValue: 1,
      })).start();
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Web Compatibility Example</Text>
      
      <Text style={styles.subtitle}>1. pointerEvents Fix</Text>
      <Text style={styles.description}>
        pointerEvents is now in the style object for web compatibility
      </Text>
      
      {/* Example of pointerEvents in style object */}
      <View style={[styles.pointerEventsDemo, { pointerEvents: 'none' }]}>
        <Text style={styles.disabledText}>This view ignores touches</Text>
      </View>

      <View style={[styles.pointerEventsDemo, { pointerEvents: 'auto' }]}>
        <TouchableOpacity onPress={() => console.log('Pressed!')}>
          <Text style={styles.enabledText}>This view accepts touches</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.subtitle, { marginTop: 20 }]}>
        2. Animation Fixes
      </Text>
      <Text style={styles.description}>
        useNativeDriver is automatically disabled on web
      </Text>

      <Animated.View
        style={[
          styles.animatedBox,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.boxText}>Animated Box</Text>
      </Animated.View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleFadeToggle}>
          <Text style={styles.buttonText}>Fade Toggle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleScale}>
          <Text style={styles.buttonText}>Scale</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSpring}>
          <Text style={styles.buttonText}>Spring</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Platform Info:</Text>
        <Text style={styles.infoText}>
          Current Platform: {Platform.OS}
        </Text>
        <Text style={styles.infoText}>
          useNativeDriver will be: {Platform.OS === 'web' ? 'false' : 'true'}
        </Text>
      </View>

      <View style={styles.codeExample}>
        <Text style={styles.codeTitle}>Usage Example:</Text>
        <Text style={styles.code}>
{`// Before (causes warnings):
<View pointerEvents="none" />

// After (web compatible):
<View style={{ pointerEvents: 'none' }} />

// Animation before:
Animated.timing(value, {
  toValue: 1,
  useNativeDriver: true, // Warning on web
})

// Animation after:
Animated.timing(value, getAnimationConfig({
  toValue: 1, // useNativeDriver handled automatically
}))`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#555',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  pointerEventsDemo: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledText: {
    color: '#999',
    textAlign: 'center',
  },
  enabledText: {
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '500',
  },
  animatedBox: {
    width: 150,
    height: 100,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
  },
  boxText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
  },
  infoBox: {
    padding: 15,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  codeExample: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
  },
  codeTitle: {
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
});

export default WebCompatibilityExample;