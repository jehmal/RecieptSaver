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
import { useAuth } from '../../contexts/AuthContext';
import { AuthInput } from '../../components/auth/AuthInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthStackParamList } from './AuthLandingScreen';

type SignInNavigationProp = StackNavigationProp<AuthStackParamList, 'SignIn'>;

export const SignInScreen: React.FC = () => {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const navigation = useNavigation<SignInNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation will be handled automatically by AppNavigator based on auth state
    } catch (error) {
      // TODO: Handle error
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
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
                Welcome back!
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                Sign in to continue tracking your spending
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <AuthInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCompleteType="email"
                textContentType="emailAddress"
              />
              <AuthInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCompleteType="password"
                textContentType="password"
              />
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: theme.colors.text.secondary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            <AuthButton
              title="Sign In"
              variant="primary"
              loading={loading}
              onPress={handleSignIn}
              style={styles.signInButton}
            />

            <View style={styles.signUpContainer}>
              <Text style={[styles.signUpText, { color: theme.colors.text.secondary }]}>
                Don't have an account?{' '}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AccountType')}>
                <Text style={[styles.signUpLink, { color: theme.colors.text.primary }]}>
                  Sign Up
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
    marginBottom: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    fontSize: 15,
  },
  signInButton: {
    marginBottom: 24,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 15,
  },
  signUpLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});