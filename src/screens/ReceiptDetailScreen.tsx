import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Modal,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { format, parseISO, isValid } from 'date-fns';
import { useTheme } from '../contexts/ThemeContext';
import { useReceipts, Receipt } from '../contexts/ReceiptContext';
import {
  ReceiptImageViewer,
  ReceiptInfoGrid,
  ReceiptTags,
  ActionButtons,
  Tag as ComponentTag,
} from '../components/receipt';
import ReceiptEditForm from '../components/receipt/ReceiptEditForm';
import { shareReceipt, exportReceiptAsPDF, shareReceiptAsText } from '../utils/receiptExport';

// Navigation types
interface ReceiptDetailScreenProps {
  navigation: any;
  route: {
    params: {
      receipt: Receipt;
    };
  };
}

// Tag type alias for local state
type Tag = ComponentTag & { name: string };

// Screen dimensions
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const MODAL_MAX_HEIGHT = screenHeight * 0.9;
const DISMISS_THRESHOLD = 150;

const ReceiptDetailScreen: React.FC<ReceiptDetailScreenProps> = ({ navigation, route }) => {
  const { receipt } = route.params;
  const { theme, themeMode } = useTheme();
  const { updateReceipt } = useReceipts();
  
  // State
  const [hasImageError, setHasImageError] = useState(false);
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: 'Business', label: 'Business', isSelected: true },
    { id: '2', name: 'Personal', label: 'Personal', isSelected: false },
    { id: '3', name: 'Tax Deductible', label: 'Tax Deductible', isSelected: false },
    { id: '4', name: 'Reimbursable', label: 'Reimbursable', isSelected: false },
  ]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [receiptData, setReceiptData] = useState<Receipt>(receipt);

  // Animation values
  const translateY = useRef(new Animated.Value(screenHeight)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;

  // Format date function with proper error handling
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'No date';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        // Try parsing as regular Date if ISO parsing fails
        const fallbackDate = new Date(dateString);
        if (!isValid(fallbackDate)) return 'Invalid date';
        return format(fallbackDate, 'MMM d, yyyy');
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  // Format time function with proper error handling
  const formatTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'No time';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) {
        // Try parsing as regular Date if ISO parsing fails
        const fallbackDate = new Date(dateString);
        if (!isValid(fallbackDate)) return 'Invalid time';
        return format(fallbackDate, 'h:mm a');
      }
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Close modal animation and navigation
  const closeModal = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: screenHeight,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(modalOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  };

  // Pan gesture handler
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: gestureTranslateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (nativeEvent.state === State.END) {
      const { translationY, velocityY } = nativeEvent;
      
      // Dismiss if dragged down enough or with velocity
      if (translationY > DISMISS_THRESHOLD || velocityY > 800) {
        closeModal();
      } else {
        // Snap back to position
        Animated.spring(gestureTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          stiffness: 200,
          damping: 20,
        }).start();
      }
    }
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setTags((prevTags) =>
      prevTags.map((tag) =>
        tag.id === tagId ? { ...tag, isSelected: !tag.isSelected } : tag
      )
    );
  };

  // Add new tag
  const handleAddTag = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert('Add Tag', 'Enter a new tag name:', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        onPress: () => {
          // In real app, this would open a text input dialog
          const newTag: Tag = {
            id: Date.now().toString(),
            name: 'New Tag',
            label: 'New Tag',
            isSelected: true,
          };
          setTags((prevTags) => [...prevTags, newTag]);
        },
      },
    ]);
  };

  // Handle menu actions
  const handleMenuAction = async (action: string) => {
    setShowMenuModal(false);
    
    switch (action) {
      case 'edit':
        setIsEditing(true);
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        break;
      case 'export-pdf':
        try {
          const pdfUri = await exportReceiptAsPDF(receiptData);
          if (pdfUri) {
            Alert.alert('Success', 'Receipt exported as PDF successfully');
          } else {
            Alert.alert('Error', 'Failed to export PDF');
          }
        } catch (error) {
          Alert.alert('Error', 'Failed to export PDF');
        }
        break;
      case 'export-image':
        try {
          await shareReceipt(receiptData, { format: 'image' });
        } catch (error) {
          Alert.alert('Error', 'Failed to share receipt image');
        }
        break;
      case 'delete':
        Alert.alert(
          'Delete Receipt',
          'Are you sure you want to delete this receipt?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Delete', 
              style: 'destructive',
              onPress: () => {
                closeModal();
                // In real app, this would delete the receipt
              }
            },
          ]
        );
        break;
      case 'report':
        Alert.alert('Report Issue', 'Thank you for your feedback');
        break;
    }
  };

  // Handle export
  const handleExport = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert('Export Receipt', 'Choose export format', [
      { text: 'PDF', onPress: () => handleMenuAction('export-pdf') },
      { text: 'Image', onPress: () => handleMenuAction('export-image') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Handle share
  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    Alert.alert('Share Receipt', 'Choose share format', [
      { 
        text: 'Share as PDF', 
        onPress: async () => {
          try {
            await shareReceipt(receiptData, { format: 'pdf' });
          } catch (error) {
            Alert.alert('Error', 'Failed to share receipt as PDF');
          }
        }
      },
      { 
        text: 'Share as Image', 
        onPress: async () => {
          try {
            await shareReceipt(receiptData, { format: 'image' });
          } catch (error) {
            Alert.alert('Error', 'Failed to share receipt image');
          }
        }
      },
      { 
        text: 'Share as Text', 
        onPress: async () => {
          try {
            await shareReceiptAsText(receiptData);
          } catch (error) {
            Alert.alert('Error', 'Failed to share receipt as text');
          }
        }
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Handle save from edit form
  const handleSaveReceipt = async (updatedReceipt: Receipt) => {
    try {
      console.log('Saving receipt with ID:', updatedReceipt.id);
      console.log('Updated data:', updatedReceipt);
      
      // Update in context/global state
      await updateReceipt(updatedReceipt.id, updatedReceipt);
      
      // Update local state
      setReceiptData(updatedReceipt);
      setIsEditing(false);
      
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert('Success', 'Receipt updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update receipt. Please try again.');
      console.error('Error updating receipt:', error);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Animated combined transform
  const animatedStyle = {
    transform: [
      { translateY: Animated.add(translateY, gestureTranslateY) },
    ],
  };

  const styles = StyleSheet.create({
    gestureContainer: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    backdropTouch: {
      flex: 1,
    },
    modalContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: MODAL_MAX_HEIGHT,
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      ...theme.shadows.lg,
    },
    modalContent: {
      flex: 1,
    },
    dragIndicatorContainer: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    dragIndicator: {
      width: 36,
      height: 5,
      backgroundColor: theme.colors.card.border,
      borderRadius: 3,
    },
    header: {
      height: 56,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    headerButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    imageSection: {
      height: 280,
      marginHorizontal: 16,
      marginTop: 8,
    },
    merchantSection: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    merchantName: {
      fontSize: 28,
      fontWeight: '600',
      color: theme.colors.text.primary,
      lineHeight: 34,
    },
    categoryBadge: {
      backgroundColor: theme.colors.surfaceLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    categoryText: {
      fontSize: 15,
      fontWeight: '500',
      color: theme.colors.text.secondary,
    },
    menuBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 14,
      width: '80%',
      maxWidth: 320,
      paddingVertical: 8,
      ...theme.shadows.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    menuText: {
      fontSize: 16,
      color: theme.colors.text.primary,
      marginLeft: 12,
    },
    menuDivider: {
      height: 1,
      backgroundColor: theme.colors.card.border,
      marginVertical: 8,
      marginHorizontal: 16,
    },
  });

  return (
    <Modal
      visible={true}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeModal}
    >
      <GestureHandlerRootView style={styles.gestureContainer}>
        <>
          <Animated.View 
            style={[
              styles.backdrop,
              { opacity: modalOpacity }
            ]}
          >
            <TouchableOpacity 
              style={styles.backdropTouch} 
              activeOpacity={1} 
              onPress={closeModal} 
            />
          </Animated.View>

          <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          activeOffsetY={[-10, 10]}
        >
          <Animated.View style={[styles.modalContainer, animatedStyle]}>
            <SafeAreaView style={styles.modalContent}>
              {isEditing ? (
                // Edit Form
                <ReceiptEditForm
                  receipt={receiptData}
                  onSave={handleSaveReceipt}
                  onCancel={handleCancelEdit}
                  autoSave={true}
                  autoSaveDelay={2000}
                />
              ) : (
                // Detail View
                <>
                  {/* Drag Indicator */}
                  <View style={styles.dragIndicatorContainer}>
                    <View style={styles.dragIndicator} />
                  </View>

                  {/* Header */}
                  <View style={styles.header}>
                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={closeModal}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="close" size={24} color={theme.colors.text.secondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.headerButton}
                      onPress={() => setShowMenuModal(true)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text.secondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Scrollable Content */}
                  <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    bounces={true}
                  >
                    {/* Receipt Image Section */}
                    <View style={styles.imageSection}>
                      <ReceiptImageViewer
                        imageUri={receiptData.imageUri}
                        onError={() => setHasImageError(true)}
                      />
                    </View>

                    {/* Merchant Information */}
                    <View style={styles.merchantSection}>
                      <Text style={styles.merchantName}>{receiptData.merchant}</Text>
                      {receiptData.category && (
                        <View style={styles.categoryBadge}>
                          <Text style={styles.categoryText}>{receiptData.category}</Text>
                        </View>
                      )}
                    </View>

                    {/* Receipt Details Grid */}
                    <ReceiptInfoGrid
                      amount={`$${receiptData.amount.toFixed(2)}`}
                      date={formatDate(receiptData.date)}
                      paymentMethod="•••• 1234"
                      time={formatTime(receiptData.createdAt)}
                    />

                    {/* Tags Section */}
                    <ReceiptTags
                      tags={tags}
                      onTagPress={toggleTag}
                      onAddTag={handleAddTag}
                    />

                    {/* Bottom spacing for action buttons */}
                    <View style={{ height: 140 }} />
                  </ScrollView>

                  {/* Action Buttons */}
                  <ActionButtons
                    onExport={handleExport}
                    onShare={handleShare}
                  />
                </>
              )}
            </SafeAreaView>
          </Animated.View>
        </PanGestureHandler>

        {/* Menu Modal */}
        {showMenuModal && (
          <TouchableOpacity 
            style={styles.menuBackdrop} 
            activeOpacity={1}
            onPress={() => setShowMenuModal(false)}
          >
            <View style={styles.menuContainer}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuAction('edit')}
              >
                <Ionicons name="create-outline" size={20} color={theme.colors.text.primary} />
                <Text style={styles.menuText}>Edit Receipt</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuAction('export-pdf')}
              >
                <Ionicons name="document-outline" size={20} color={theme.colors.text.primary} />
                <Text style={styles.menuText}>Export PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuAction('export-image')}
              >
                <Ionicons name="image-outline" size={20} color={theme.colors.text.primary} />
                <Text style={styles.menuText}>Export Image</Text>
              </TouchableOpacity>

              <View style={styles.menuDivider} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuAction('delete')}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.accent.error} />
                <Text style={[styles.menuText, { color: theme.colors.accent.error }]}>Delete Receipt</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuAction('report')}
              >
                <Ionicons name="flag-outline" size={20} color={theme.colors.text.primary} />
                <Text style={styles.menuText}>Report Issue</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        </>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default ReceiptDetailScreen;