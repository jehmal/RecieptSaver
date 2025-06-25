import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../contexts/ThemeContext';
import { AuthButton } from '../../components/auth/AuthButton';
import { AuthStackParamList } from './AuthLandingScreen';

type AccountTypeNavigationProp = StackNavigationProp<AuthStackParamList, 'AccountType'>;

export const AccountTypeScreen: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<AccountTypeNavigationProp>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backText, { color: theme.colors.text.primary }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.logo, { color: theme.colors.text.primary }]}>
            BLACKBIRD
          </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>
              Let's get started!
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              What type of account would you like to create?
            </Text>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={[styles.optionCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('PersonalSignup')}
            >
              <Text style={[styles.optionTitle, { color: theme.colors.text.primary }]}>
                Personal
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.text.secondary }]}>
                Track your personal receipts and expenses
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.optionCard, { backgroundColor: theme.colors.surface }]}
              onPress={() => navigation.navigate('CompanySignup')}
            >
              <Text style={[styles.optionTitle, { color: theme.colors.text.primary }]}>
                Company
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.text.secondary }]}>
                Manage receipts for your business
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: theme.colors.text.tertiary }]} />
              <Text style={[styles.dividerText, { color: theme.colors.text.secondary }]}>
                OR
              </Text>
              <View style={[styles.divider, { backgroundColor: theme.colors.text.tertiary }]} />
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('EmployeeSignup', {})}
              style={styles.employeeOption}
            >
              <Text style={[styles.employeeText, { color: theme.colors.text.primary }]}>
                I'm an employee with a company code
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
  mainContent: {
    flex: 1,
  },
  titleContainer: {
    marginBottom: 40,
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
  optionsContainer: {
    gap: 16,
  },
  optionCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 15,
    lineHeight: 22,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  employeeOption: {
    alignItems: 'center',
  },
  employeeText: {
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  signInText: {
    fontSize: 15,
  },
  signInLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});