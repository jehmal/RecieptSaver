import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthStackParamList } from './AuthLandingScreen';

type PersonalSignupNavigationProp = StackNavigationProp<AuthStackParamList, 'PersonalSignup'>;

export const PersonalSignupScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<PersonalSignupNavigationProp>();
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    // TODO: Implement actual sign up logic
    setTimeout(() => {
      setLoading(false);
      // Navigate to main app or verification screen
    }, 2000);
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={[styles.backText, { color: theme.colors.text.primary }]}>←</Text>
            </TouchableOpacity>
            <Text style={[styles.logo, { color: theme.colors.text.primary }]}>
              BLACKBIRD
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: theme.colors.text.primary }]}>
                Create your account
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                Start tracking your receipts in seconds
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <AuthInput
                    placeholder="First name"
                    value={formData.firstName}
                    onChangeText={(value) => updateFormData('firstName', value)}
                    autoCompleteType="name"
                    textContentType="givenName"
                  />
                </View>
                <View style={styles.nameInput}>
                  <AuthInput
                    placeholder="Last name"
                    value={formData.lastName}
                    onChangeText={(value) => updateFormData('lastName', value)}
                    autoCompleteType="name"
                    textContentType="familyName"
                  />
                </View>
              </View>
              
              <AuthInput
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCompleteType="email"
                textContentType="emailAddress"
              />
              
              <AuthInput
                placeholder="Password"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                autoCompleteType="password"
                textContentType="newPassword"
              />
            </View>

            <Text style={[styles.termsText, { color: theme.colors.text.secondary }]}>
              By creating an account, you agree to our{' '}
              <Text style={{ color: theme.colors.text.primary, fontWeight: '500' }}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text style={{ color: theme.colors.text.primary, fontWeight: '500' }}>
                Privacy Policy
              </Text>
            </Text>

            <AuthButton
              title="Create Account"
              variant="primary"
              loading={loading}
              onPress={handleSignUp}
              style={styles.signUpButton}
            />

            <View style={styles.signInContainer}>
              <Text style={[styles.signInText, { color: theme.colors.text.secondary }]}>
                Already have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
                <Text style={[styles.signInLink, { color: theme.colors.text.primary }]}>
                  Sign In
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 48,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  backText: {
    fontSize: 28,
    fontWeight: '300',
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  formContainer: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
  },
  nameInput: {
    flex: 1,
  },
  termsText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  signUpButton: {
    marginBottom: 24,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 15,
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});