import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface BulkActionsMenuProps {
  visible: boolean;
  selectedCount: number;
  onCategorize: () => void;
  onDelete: () => void;
  onExport: () => void;
  onClose: () => void;
}

const BulkActionsMenu: React.FC<BulkActionsMenuProps> = ({
  visible,
  selectedCount,
  onCategorize,
  onDelete,
  onExport,
  onClose,
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleAction = (action: () => void) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    action();
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.card.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 8,
      paddingBottom: Platform.OS === 'ios' ? 34 : 24,
      elevation: 10,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: -3,
      },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.text.tertiary,
      borderRadius: 2,
      alignSelf: 'center',
      marginVertical: 8,
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    headerText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
    actionsContainer: {
      paddingTop: 8,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      gap: 16,
    },
    actionIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionContent: {
      flex: 1,
    },
    actionText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text.primary,
      marginBottom: 2,
    },
    actionDescription: {
      fontSize: 13,
      color: theme.colors.text.secondary,
    },
    deleteButton: {
      marginTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.card.border,
    },
    deleteIconContainer: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    deleteText: {
      color: '#FF3B30',
    },
    cancelButton: {
      marginTop: 16,
      marginHorizontal: 20,
      paddingVertical: 14,
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ translateY: slideAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            
            <View style={styles.header}>
              <Text style={styles.headerText}>
                {selectedCount} {selectedCount === 1 ? 'Receipt' : 'Receipts'} Selected
              </Text>
            </View>

            <ScrollView style={styles.actionsContainer} bounces={false}>
              {/* Categorize Action */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction(onCategorize)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: theme.colors.accent.primary + '20' }]}>
                  <MaterialIcons name="category" size={24} color={theme.colors.accent.primary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>Categorize</Text>
                  <Text style={styles.actionDescription}>Assign or change category</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
              </TouchableOpacity>

              {/* Export Action */}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleAction(onExport)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, { backgroundColor: '#34C759' + '20' }]}>
                  <Ionicons name="share-outline" size={24} color="#34C759" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionText}>Export</Text>
                  <Text style={styles.actionDescription}>Save as PDF or CSV</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
              </TouchableOpacity>

              {/* Delete Action */}
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleAction(onDelete)}
                activeOpacity={0.7}
              >
                <View style={[styles.actionIconContainer, styles.deleteIconContainer]}>
                  <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </View>
                <View style={styles.actionContent}>
                  <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                  <Text style={styles.actionDescription}>Move to trash</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default BulkActionsMenu;