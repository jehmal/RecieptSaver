import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthButton } from '../../components/auth/AuthButton';

// Define the auth stack param list
export type AuthStackParamList = {
  Onboarding: undefined;
  AuthLanding: undefined;
  SignIn: undefined;
  AccountType: undefined;
  PersonalSignup: undefined;
  CompanySignup: undefined;
  EmployeeSignup: { companyCode?: string };
};

type AuthLandingNavigationProp = StackNavigationProp<AuthStackParamList, 'AuthLanding'>;

export const AuthLandingScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<AuthLandingNavigationProp>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={[styles.logo, { color: theme.colors.text.primary }]}>
            BLACKBIRD
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <AuthButton
            title="Sign In"
            variant="primary"
            onPress={() => navigation.navigate('SignIn')}
          />
          <AuthButton
            title="Create Account"
            variant="secondary"
            onPress={() => navigation.navigate('AccountType')}
          />
        </View>

        <Text style={[styles.tagline, { color: theme.colors.text.secondary }]}>
          Track, save, and grow smarter
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 48,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
  },
  buttonContainer: {
    marginBottom: 32,
  },
  tagline: {
    textAlign: 'center',
    fontSize: 15,
  },
});