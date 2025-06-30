import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';
import { Warranty } from '../../types/warranty';
import { RenewalReminder } from '../../types/warrantyActions';
import * as Haptics from 'expo-haptics';

interface RenewalReminderModalProps {
  visible: boolean;
  warranty: Warranty;
  onClose: () => void;
  onSave: (reminder: RenewalReminder) => void;
}

const RenewalReminderModal: React.FC<RenewalReminderModalProps> = ({
  visible,
  warranty,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const [reminderDate, setReminderDate] = useState(() => {
    const date = new Date(warranty.expiryDate);
    date.setDate(date.getDate() - 30); // Default to 30 days before expiry
    return date;
  });
  const [notificationTime, setNotificationTime] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDaysBefore, setSelectedDaysBefore] = useState(30);

  const dayOptions = [
    { label: '1 week before', days: 7 },
    { label: '2 weeks before', days: 14 },
    { label: '1 month before', days: 30 },
    { label: '2 months before', days: 60 },
    { label: '3 months before', days: 90 },
  ];

  const timeOptions = [
    { label: 'Morning (9:00 AM)', value: 'morning' as const, icon: 'sunny-outline' },
    { label: 'Afternoon (2:00 PM)', value: 'afternoon' as const, icon: 'partly-sunny-outline' },
    { label: 'Evening (6:00 PM)', value: 'evening' as const, icon: 'moon-outline' },
  ];

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const reminder: RenewalReminder = {
      warrantyId: warranty.id,
      reminderDate: reminderDate.toISOString(),
      notificationTime,
      isEnabled: true,
      createdAt: new Date().toISOString(),
    };

    onSave(reminder);
  };

  const handleDayOptionPress = (days: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDaysBefore(days);
    const date = new Date(warranty.expiryDate);
    date.setDate(date.getDate() - days);
    setReminderDate(date);
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
      paddingBottom: Platform.OS === 'ios' ? 40 : 20,
      ...theme.shadows.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    closeButton: {
      padding: theme.spacing.xs,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    optionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectedOption: {
      backgroundColor: theme.colors.primary,
    },
    optionLabel: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    selectedOptionLabel: {
      color: '#FFFFFF',
    },
    checkmark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    timeOption: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginHorizontal: theme.spacing.xs,
      alignItems: 'center',
    },
    selectedTimeOption: {
      backgroundColor: theme.colors.primary,
    },
    timeIcon: {
      marginBottom: theme.spacing.xs,
    },
    timeLabel: {
      fontSize: 14,
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    selectedTimeLabel: {
      color: '#FFFFFF',
    },
    dateDisplay: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    dateText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginTop: theme.spacing.sm,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.lg,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
  });

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
            <Text style={styles.title}>Set Renewal Reminder</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* When to Remind */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>When to remind me</Text>
              {dayOptions.map((option) => (
                <TouchableOpacity
                  key={option.days}
                  style={[
                    styles.optionCard,
                    selectedDaysBefore === option.days && styles.selectedOption,
                  ]}
                  onPress={() => handleDayOptionPress(option.days)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedDaysBefore === option.days && styles.selectedOptionLabel,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {selectedDaysBefore === option.days && (
                    <View style={styles.checkmark}>
                      <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Reminder Date Display */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Reminder will be sent on</Text>
              <TouchableOpacity
                style={styles.dateDisplay}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
                <Text style={styles.dateText}>
                  {reminderDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Time of Day */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Time of day</Text>
              <View style={{ flexDirection: 'row' }}>
                {timeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timeOption,
                      notificationTime === option.value && styles.selectedTimeOption,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setNotificationTime(option.value);
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={24}
                      color={notificationTime === option.value ? '#FFFFFF' : theme.colors.primary}
                      style={styles.timeIcon}
                    />
                    <Text
                      style={[
                        styles.timeLabel,
                        notificationTime === option.value && styles.selectedTimeLabel,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveButtonText}>Set Reminder</Text>
            </TouchableOpacity>
          </ScrollView>

          {showDatePicker && (
            <DateTimePicker
              value={reminderDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setReminderDate(selectedDate);
                  // Calculate days before expiry
                  const daysDiff = Math.ceil(
                    (new Date(warranty.expiryDate).getTime() - selectedDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                  );
                  setSelectedDaysBefore(daysDiff);
                }
              }}
              maximumDate={new Date(warranty.expiryDate)}
              minimumDate={new Date()}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

export default RenewalReminderModal;