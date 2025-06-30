import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Warranty, calculateWarrantyStatus } from '../../types/warranty';
import { warrantyActions, WarrantyAction } from '../../types/warrantyActions';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import RenewalReminderModal from './RenewalReminderModal';
import ClaimFilingModal from './ClaimFilingModal';

interface WarrantyDetailModalProps {
  visible: boolean;
  warranty: Warranty | null;
  onClose: () => void;
  onActionPress: (action: WarrantyAction) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const WarrantyDetailModal: React.FC<WarrantyDetailModalProps> = ({
  visible,
  warranty,
  onClose,
  onActionPress,
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 200,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!warranty) return null;

  const { daysRemaining, status, urgency } = calculateWarrantyStatus(warranty.expiryDate);
  
  const statusColor = 
    status === 'expired' ? '#8E8E93' :
    daysRemaining <= 30 ? '#FF3B30' :
    daysRemaining <= 90 ? '#FF9500' : '#34C759';
  
  const gradientColors = 
    status === 'expired' ? ['#48484A', '#8E8E93'] :
    daysRemaining <= 30 ? ['#FF3B30', '#FF6B6B'] :
    daysRemaining <= 90 ? ['#FF6B00', '#FFB800'] : ['#007AFF', '#34C759'];

  const handleActionPress = (action: WarrantyAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch (action.type) {
      case 'renewal_reminder':
        setShowRenewalModal(true);
        break;
      case 'file_claim':
        setShowClaimModal(true);
        break;
      case 'extend_warranty':
        Alert.alert(
          'Extend Warranty',
          'Would you like to extend this warranty?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'View Options', 
              onPress: () => {
                onActionPress(action);
                Alert.alert('Coming Soon', 'Warranty extension options will be available soon.');
              }
            },
          ]
        );
        break;
      case 'contact_support':
        Alert.alert(
          'Contact Support',
          `Would you like to contact ${warranty.supplier} support?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Call Support', 
              onPress: () => {
                onActionPress(action);
                Alert.alert('Support', `Calling ${warranty.supplier} support...`);
              }
            },
          ]
        );
        break;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.card.background,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: SCREEN_HEIGHT * 0.9,
      ...theme.shadows.lg,
    },
    handle: {
      width: 36,
      height: 5,
      backgroundColor: theme.colors.card.border,
      borderRadius: 3,
      alignSelf: 'center',
      marginTop: theme.spacing.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      paddingBottom: 0,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text.primary,
      flex: 1,
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
      paddingBottom: Platform.OS === 'ios' ? 40 : theme.spacing.xl,
    },
    gradientCard: {
      margin: theme.spacing.lg,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    gradientContent: {
      padding: theme.spacing.md,
    },
    statusCard: {
      backgroundColor: 'rgba(28, 28, 30, 0.85)',
      borderRadius: theme.borderRadius.lg - 2,
      padding: theme.spacing.lg,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    statusLabel: {
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    statusValue: {
      fontSize: 20,
      fontWeight: '600',
      color: statusColor,
    },
    detailSection: {
      paddingHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    detailLabel: {
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    detailValue: {
      fontSize: 16,
      color: theme.colors.text.primary,
      fontWeight: '500',
    },
    actionsSection: {
      paddingHorizontal: theme.spacing.lg,
    },
    actionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -theme.spacing.xs,
    },
    actionCard: {
      width: '48%',
      margin: '1%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    actionLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      textAlign: 'center',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        >
          <Animated.View style={{ flex: 1, opacity: backdropOpacity }} />
        </TouchableOpacity>

        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {warranty.itemName}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Status Card */}
            <View style={styles.gradientCard}>
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradientContent}
              >
                <View style={styles.statusCard}>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Status</Text>
                    <Text style={styles.statusValue}>
                      {status === 'expired' ? 'Expired' : 
                       status === 'expiring' ? 'Expiring Soon' : 'Active'}
                    </Text>
                  </View>
                  <View style={styles.statusRow}>
                    <Text style={styles.statusLabel}>Days Remaining</Text>
                    <Text style={styles.statusValue}>
                      {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days`}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Details Section */}
            <View style={styles.detailSection}>
              <Text style={styles.sectionTitle}>Warranty Details</Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Serial Number</Text>
                <Text style={styles.detailValue}>{warranty.serialNumber}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Purchase Date</Text>
                <Text style={styles.detailValue}>{warranty.purchaseDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Expiry Date</Text>
                <Text style={styles.detailValue}>{warranty.expiryDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Supplier</Text>
                <Text style={styles.detailValue}>{warranty.supplier}</Text>
              </View>
              {warranty.category && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{warranty.category}</Text>
                </View>
              )}
            </View>

            {/* Actions Section */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionGrid}>
                {warrantyActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    style={styles.actionCard}
                    onPress={() => handleActionPress(action)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIcon, { backgroundColor: `${action.color}20` }]}>
                      <Ionicons name={action.icon as any} size={24} color={action.color} />
                    </View>
                    <Text style={styles.actionLabel}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {warranty.notes && (
              <View style={styles.detailSection}>
                <Text style={styles.sectionTitle}>Notes</Text>
                <Text style={[styles.detailValue, { lineHeight: 22 }]}>
                  {warranty.notes}
                </Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* Sub-modals */}
        <RenewalReminderModal
          visible={showRenewalModal}
          warranty={warranty}
          onClose={() => setShowRenewalModal(false)}
          onSave={(reminder) => {
            setShowRenewalModal(false);
            Alert.alert('Success', 'Renewal reminder has been set!');
          }}
        />

        <ClaimFilingModal
          visible={showClaimModal}
          warranty={warranty}
          onClose={() => setShowClaimModal(false)}
          onSubmit={(claim) => {
            setShowClaimModal(false);
            Alert.alert('Success', 'Your claim has been submitted!');
          }}
        />
      </View>
    </Modal>
  );
};

export default WarrantyDetailModal;