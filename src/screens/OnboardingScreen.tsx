import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { AuthStackParamList } from './auth';

type OnboardingNavigationProp = StackNavigationProp<AuthStackParamList, 'Onboarding'>;

export const OnboardingScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<OnboardingNavigationProp>();

  const handleContinue = () => {
    navigation.navigate('AuthLanding');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/onboarding-background.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.4)' }]}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.content}>
              <View style={styles.bottomContent}>
                <Text style={styles.subtitle}>How it works</Text>
                <Text style={styles.title}>
                  Take a photo of your receipt. We do the rest.
                </Text>
                <Text style={styles.tagline}>
                  They'll take it from there.
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Ionicons 
                  name="arrow-forward-circle" 
                  size={56} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  bottomContent: {
    marginBottom: 80,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.7,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 41,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    opacity: 0.6,
    letterSpacing: 0.2,
  },
  continueButton: {
    alignSelf: 'center',
    marginBottom: 20,
  },
});