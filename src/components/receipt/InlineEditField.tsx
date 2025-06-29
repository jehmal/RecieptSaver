import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../contexts/ThemeContext';

interface InlineEditFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  validate?: (value: string) => string | null;
  multiline?: boolean;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address';
  formatValue?: (value: string) => string;
  displayValue?: (value: string) => string;
  editable?: boolean;
}

const InlineEditField: React.FC<InlineEditFieldProps> = ({
  label,
  value,
  onSave,
  validate,
  multiline = false,
  keyboardType = 'default',
  formatValue,
  displayValue,
  editable = true,
}) => {
  const { theme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (!editable) return;
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsEditing(true);
    setError(null);
  };

  const handleSave = () => {
    const formattedValue = formatValue ? formatValue(editValue) : editValue;
    
    if (validate) {
      const validationError = validate(formattedValue);
      if (validationError) {
        setError(validationError);
        if (Platform.OS !== 'web') {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        return;
      }
    }

    onSave(formattedValue);
    setIsEditing(false);
    setError(null);
    
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
    setError(null);
  };

  const handleChange = (text: string) => {
    setEditValue(text);
    if (error) {
      setError(null);
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    labelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    valueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 44,
    },
    value: {
      fontSize: 16,
      color: theme.colors.text.primary,
      flex: 1,
    },
    editButton: {
      padding: 8,
      marginLeft: 8,
    },
    editContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text.primary,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: theme.colors.primary,
      minHeight: 44,
    },
    inputError: {
      borderColor: theme.colors.accent.error,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 4,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
    },
    cancelButton: {
      backgroundColor: theme.colors.surfaceLight,
    },
    error: {
      fontSize: 12,
      color: theme.colors.accent.error,
      marginTop: 4,
    },
    notEditable: {
      opacity: 0.6,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
      </View>

      {!isEditing ? (
        <TouchableOpacity
          style={[styles.valueContainer, !editable && styles.notEditable]}
          onPress={handleEdit}
          disabled={!editable}
        >
          <Text style={styles.value}>
            {displayValue ? displayValue(value) : value}
          </Text>
          {editable && (
            <View style={styles.editButton}>
              <Ionicons
                name="pencil"
                size={16}
                color={theme.colors.text.secondary}
              />
            </View>
          )}
        </TouchableOpacity>
      ) : (
        <Animated.View style={[styles.editContainer, { opacity: fadeAnim }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, error && styles.inputError]}
            value={editValue}
            onChangeText={handleChange}
            keyboardType={keyboardType}
            multiline={multiline}
            onSubmitEditing={multiline ? undefined : handleSave}
            blurOnSubmit={!multiline}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.saveButton]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Ionicons name="close" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default InlineEditField;