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

type CompanySignupNavigationProp = StackNavigationProp<AuthStackParamList, 'CompanySignup'>;

export const CompanySignupScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<CompanySignupNavigationProp>();
  
  const [formData, setFormData] = useState({
    companyName: '',
    adminFirstName: '',
    adminLastName: '',
    email: '',
    password: '',
    employeeCount: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    // TODO: Implement actual sign up logic
    setTimeout(() => {
      setLoading(false);
      // Navigate to company setup or verification screen
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
                Create company account
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                Streamline expense tracking for your entire team
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <AuthInput
                placeholder="Company name"
                value={formData.companyName}
                onChangeText={(value) => updateFormData('companyName', value)}
                autoCompleteType="organization"
              />
              
              <View style={styles.nameRow}>
                <View style={styles.nameInput}>
                  <AuthInput
                    placeholder="Your first name"
                    value={formData.adminFirstName}
                    onChangeText={(value) => updateFormData('adminFirstName', value)}
                    autoCompleteType="name"
                    textContentType="givenName"
                  />
                </View>
                <View style={styles.nameInput}>
                  <AuthInput
                    placeholder="Your last name"
                    value={formData.adminLastName}
                    onChangeText={(value) => updateFormData('adminLastName', value)}
                    autoCompleteType="name"
                    textContentType="familyName"
                  />
                </View>
              </View>
              
              <AuthInput
                placeholder="Work email"
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
              
              <AuthInput
                placeholder="Number of employees (optional)"
                value={formData.employeeCount}
                onChangeText={(value) => updateFormData('employeeCount', value)}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={[styles.benefitsTitle, { color: theme.colors.text.primary }]}>
                Company benefits include:
              </Text>
              <View style={styles.benefitItem}>
                <Text style={[styles.benefitBullet, { color: theme.colors.accent.primary }]}>•</Text>
                <Text style={[styles.benefitText, { color: theme.colors.text.secondary }]}>
                  Team expense analytics
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={[styles.benefitBullet, { color: theme.colors.accent.primary }]}>•</Text>
                <Text style={[styles.benefitText, { color: theme.colors.text.secondary }]}>
                  Automated expense reports
                </Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={[styles.benefitBullet, { color: theme.colors.accent.primary }]}>•</Text>
                <Text style={[styles.benefitText, { color: theme.colors.text.secondary }]}>
                  Employee spending controls
                </Text>
              </View>
            </View>

            <AuthButton
              title="Create Company Account"
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
    paddingBottom: 32,
  },
  header: {
    marginTop: 20,
    marginBottom: 32,
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
    fontSize: 28,
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
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitBullet: {
    fontSize: 16,
    marginRight: 8,
  },
  benefitText: {
    fontSize: 15,
    flex: 1,
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