import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export const LongPressDebug: React.FC = () => {
  const [pressCount, setPressCount] = useState(0);
  const [longPressCount, setLongPressCount] = useState(0);

  const handlePress = () => {
    setPressCount(prev => prev + 1);
    console.log('Press detected');
  };

  const handleLongPress = () => {
    setLongPressCount(prev => prev + 1);
    console.log('Long press detected!');
    Alert.alert('Long Press', 'Long press was successful!');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
      >
        <Text style={styles.buttonText}>Press and Hold Me</Text>
      </TouchableOpacity>
      <Text style={styles.stats}>Presses: {pressCount}</Text>
      <Text style={styles.stats}>Long Presses: {longPressCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    margin: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stats: {
    marginTop: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default LongPressDebug;