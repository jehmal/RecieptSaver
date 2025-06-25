import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useError } from '../hooks/useError';

export const ErrorModalExample: React.FC = () => {
  const { showError } = useError();

  const handleNetworkError = () => {
    showError('Network connection failed. Please check your internet connection and try again.');
  };

  const handleValidationError = () => {
    showError('Please fill in all required fields.');
  };

  const handleGenericError = () => {
    showError('Something went wrong. Please try again later.');
  };

  return (
    <View style={styles.container}>
      <Button title="Show Network Error" onPress={handleNetworkError} />
      <View style={styles.spacing} />
      <Button title="Show Validation Error" onPress={handleValidationError} />
      <View style={styles.spacing} />
      <Button title="Show Generic Error" onPress={handleGenericError} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  spacing: {
    height: 16,
  },
});