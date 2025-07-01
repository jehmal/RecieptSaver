import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Warranty } from '../../types/warranty';
import * as Haptics from 'expo-haptics';

// TODO: Implement actual claim filing logic
// This is a stub component to prevent import errors during development
console.warn('ClaimFilingModal: Using stub implementation. Full functionality coming soon.');

interface ClaimData {
  issueDescription: string;
  dateOfIssue: string;
  contactInfo: string;
  preferredResolution: string;
}

interface ClaimFilingModalProps {
  visible: boolean;
  warranty: Warranty | null;
  onClose: () => void;
  onSubmit: (claim: ClaimData) => void;
}

const ClaimFilingModal: React.FC<ClaimFilingModalProps> = ({
  visible,
  warranty,
  onClose,
  onSubmit,
}) => {
  const { theme } = useTheme();
  const [claim, setClaim] = useState<ClaimData>({
    issueDescription: '',
    dateOfIssue: new Date().toISOString().split('T')[0],
    contactInfo: '',
    preferredResolution: '',
  });

  const handleSubmit = () => {
    if (!claim.issueDescription.trim()) {
      Alert.alert('Required Field', 'Please describe the issue you are experiencing.');
      return;
    }

    // Show development notice
    if (__DEV__) {
      Alert.alert(
        'Development Mode',
        'Claim filing is currently in development. Your claim data would be:\n\n' +
        `Issue: ${claim.issueDescription}\n` +
        `Date: ${claim.dateOfIssue}\n` +
        `Contact: ${claim.contactInfo || 'Not provided'}\n` +
        `Resolution: ${claim.preferredResolution || 'Not specified'}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Simulate Submit',
            onPress: () => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              onSubmit(claim);
            }
          }
        ]
      );
    } else {
      // Production behavior
      onSubmit(claim);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: theme.colors.card.background,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingTop: theme.spacing.md,
      paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.xl,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    devNotice: {
      backgroundColor: theme.colors.warning + '20',
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    devNoticeText: {
      color: theme.colors.warning,
      fontSize: 14,
      textAlign: 'center',
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    label: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    warrantyInfo: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      marginBottom: theme.spacing.lg,
    },
    warrantyInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    warrantyLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
    warrantyValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
    },
    submitButton: {
      backgroundColor: theme.colors.primary,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  if (!warranty) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>File a Claim</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {__DEV__ && (
              <View style={styles.devNotice}>
                <Text style={styles.devNoticeText}>
                  ⚠️ This feature is under development
                </Text>
              </View>
            )}

            {/* Warranty Information */}
            <View style={styles.warrantyInfo}>
              <View style={styles.warrantyInfoRow}>
                <Text style={styles.warrantyLabel}>Product</Text>
                <Text style={styles.warrantyValue}>{warranty.itemName}</Text>
              </View>
              <View style={styles.warrantyInfoRow}>
                <Text style={styles.warrantyLabel}>Serial Number</Text>
                <Text style={styles.warrantyValue}>{warranty.serialNumber}</Text>
              </View>
              <View style={styles.warrantyInfoRow}>
                <Text style={styles.warrantyLabel}>Supplier</Text>
                <Text style={styles.warrantyValue}>{warranty.supplier}</Text>
              </View>
            </View>

            {/* Issue Description */}
            <View style={styles.section}>
              <Text style={styles.label}>Describe the Issue *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={claim.issueDescription}
                onChangeText={(text) => setClaim({ ...claim, issueDescription: text })}
                placeholder="Please describe the problem you're experiencing..."
                placeholderTextColor={theme.colors.text.secondary}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Date of Issue */}
            <View style={styles.section}>
              <Text style={styles.label}>When did the issue occur?</Text>
              <TextInput
                style={styles.input}
                value={claim.dateOfIssue}
                onChangeText={(text) => setClaim({ ...claim, dateOfIssue: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={styles.label}>Contact Information</Text>
              <TextInput
                style={styles.input}
                value={claim.contactInfo}
                onChangeText={(text) => setClaim({ ...claim, contactInfo: text })}
                placeholder="Phone or email"
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>

            {/* Preferred Resolution */}
            <View style={styles.section}>
              <Text style={styles.label}>Preferred Resolution</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={claim.preferredResolution}
                onChangeText={(text) => setClaim({ ...claim, preferredResolution: text })}
                placeholder="How would you like this resolved?"
                placeholderTextColor={theme.colors.text.secondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Submit Claim</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ClaimFilingModal;