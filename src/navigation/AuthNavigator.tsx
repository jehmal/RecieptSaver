import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  AuthLandingScreen,
  SignInScreen,
  AccountTypeScreen,
  PersonalSignupScreen,
  CompanySignupScreen,
  EmployeeSignupScreen,
  AuthStackParamList,
} from '../screens/auth';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen name="AuthLanding" component={AuthLandingScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="AccountType" component={AccountTypeScreen} />
      <Stack.Screen name="PersonalSignup" component={PersonalSignupScreen} />
      <Stack.Screen name="CompanySignup" component={CompanySignupScreen} />
      <Stack.Screen name="EmployeeSignup" component={EmployeeSignupScreen} />
    </Stack.Navigator>
  );
};