import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  TextInput,
  Switch,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
// Using react-native's Slider for web compatibility
const Slider = require('@react-native-community/slider').default;
import {
  FilterState,
  categoryOptions,
  supplierOptions,
  teamMemberOptions,
  jobSiteOptions,
} from '../../types/filters';

interface AdvancedFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onApply: () => void;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  children,
  isExpanded,
  onToggle,
}) => {
  const { theme } = useTheme();
  const animatedHeight = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isExpanded]);

  // Define styles inline for FilterSection
  const sectionStyles = StyleSheet.create({
    section: {
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    sectionContent: {
      overflow: 'hidden',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
  });

  return (
    <View style={sectionStyles.section}>
      <TouchableOpacity
        onPress={onToggle}
        style={sectionStyles.sectionHeader}
        activeOpacity={0.7}
      >
        <Text style={sectionStyles.sectionTitle}>
          {title}
        </Text>
        <Animated.View
          style={{
            transform: [
              {
                rotate: animatedHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          }}
        >
          <Ionicons
            name="chevron-down"
            size={20}
            color={theme.colors.text.secondary}
          />
        </Animated.View>
      </TouchableOpacity>
      
      <Animated.View
        style={[
          sectionStyles.sectionContent,
          {
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 500],
            }),
            opacity: animatedHeight,
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export const AdvancedFilterSheet: React.FC<AdvancedFilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onFiltersChange,
  onApply,
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    supplier: false,
    tags: false,
    team: false,
    gst: false,
    warranty: false,
    receipt: false,
    reimbursement: false,
    jobSite: false,
    subscription: false,
  });

  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onApply();
  };

  const handleReset = () => {
    const defaultFilters: FilterState = {
      categories: [],
      customCategories: [],
      dateRange: 'This Month',
      priceRange: { min: 0, max: 10000 },
      tags: [],
    };
    setLocalFilters(defaultFilters);
  };

  const renderChip = (
    label: string,
    isSelected: boolean,
    onPress: () => void,
  ) => (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        { 
          backgroundColor: isSelected 
            ? theme.colors.text.primary 
            : theme.colors.surfaceLight,
          borderWidth: isSelected ? 0 : 1,
          borderColor: theme.colors.card.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { 
            color: isSelected 
              ? theme.colors.background 
              : theme.colors.text.primary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: SHEET_HEIGHT,
      backgroundColor: theme.colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
        },
        android: {
          elevation: 20,
        },
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.card.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 16,
    },
    headerButton: {
      padding: 4,
    },
    headerButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.accent.primary,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    section: {
      borderBottomWidth: 1,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
    },
    sectionContent: {
      overflow: 'hidden',
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    priceContainer: {
      gap: 16,
    },
    priceInputs: {
      flexDirection: 'row',
      gap: 16,
    },
    priceInputWrapper: {
      flex: 1,
    },
    priceLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
      marginBottom: 4,
    },
    priceInput: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      color: theme.colors.text.primary,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
    },
    slider: {
      height: 40,
    },
    sliderLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 4,
    },
    sliderLabel: {
      fontSize: 12,
      color: theme.colors.text.secondary,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 8,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '500',
    },
    dropdownContainer: {
      backgroundColor: theme.colors.surfaceLight,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.card.border,
      paddingHorizontal: 12,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    dropdownText: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    switchLabel: {
      fontSize: 16,
      color: theme.colors.text.primary,
    },
    applyButton: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.accent.primary,
      paddingVertical: 16,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.colors.card.border,
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: backdropAnim },
            ]}
          />
        </TouchableOpacity>
        
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Advanced Filters</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleReset}
                style={styles.headerButton}
              >
                <Text style={styles.headerButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                style={styles.headerButton}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Filter Sections */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Price Range */}
            <FilterSection
              title="Price Range"
              isExpanded={expandedSections.price}
              onToggle={() => toggleSection('price')}
            >
              <View style={styles.priceContainer}>
                <View style={styles.priceInputs}>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.priceLabel}>Min</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={`$${localFilters.priceRange.min}`}
                      onChangeText={(text) => {
                        const value = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                        setLocalFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, min: value },
                        }));
                      }}
                      keyboardType="numeric"
                      placeholder="$0"
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                  </View>
                  <View style={styles.priceInputWrapper}>
                    <Text style={styles.priceLabel}>Max</Text>
                    <TextInput
                      style={styles.priceInput}
                      value={`$${localFilters.priceRange.max}`}
                      onChangeText={(text) => {
                        const value = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                        setLocalFilters(prev => ({
                          ...prev,
                          priceRange: { ...prev.priceRange, max: value },
                        }));
                      }}
                      keyboardType="numeric"
                      placeholder="$10,000"
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                  </View>
                </View>
                
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={10000}
                  value={localFilters.priceRange.max}
                  onValueChange={(value) => {
                    setLocalFilters(prev => ({
                      ...prev,
                      priceRange: { ...prev.priceRange, max: Math.round(value) },
                    }));
                  }}
                  minimumTrackTintColor={theme.colors.accent.primary}
                  maximumTrackTintColor={theme.colors.surfaceLight}
                  thumbTintColor={theme.colors.accent.primary}
                />
                
                <View style={styles.sliderLabels}>
                  <Text style={styles.sliderLabel}>$0</Text>
                  <Text style={styles.sliderLabel}>$10,000+</Text>
                </View>
              </View>
            </FilterSection>

            {/* Supplier */}
            <FilterSection
              title="Supplier"
              isExpanded={expandedSections.supplier}
              onToggle={() => toggleSection('supplier')}
            >
              <View style={styles.chipContainer}>
                {supplierOptions.map((supplier) => 
                  renderChip(
                    supplier,
                    localFilters.supplier === supplier,
                    () => setLocalFilters(prev => ({
                      ...prev,
                      supplier: prev.supplier === supplier ? undefined : supplier,
                    }))
                  )
                )}
              </View>
            </FilterSection>

            {/* Team Member */}
            <FilterSection
              title="Team Member"
              isExpanded={expandedSections.team}
              onToggle={() => toggleSection('team')}
            >
              <View style={styles.chipContainer}>
                {teamMemberOptions.map((member) => 
                  renderChip(
                    member,
                    localFilters.teamMember === member,
                    () => setLocalFilters(prev => ({
                      ...prev,
                      teamMember: prev.teamMember === member ? undefined : member,
                    }))
                  )
                )}
              </View>
            </FilterSection>

            {/* GST Status */}
            <FilterSection
              title="GST Status"
              isExpanded={expandedSections.gst}
              onToggle={() => toggleSection('gst')}
            >
              <View style={styles.chipContainer}>
                {['Included', 'Excluded', 'Mixed'].map((status) => 
                  renderChip(
                    status,
                    localFilters.gstStatus === status,
                    () => setLocalFilters(prev => ({
                      ...prev,
                      gstStatus: prev.gstStatus === status 
                        ? undefined 
                        : status as 'Included' | 'Excluded' | 'Mixed',
                    }))
                  )
                )}
              </View>
            </FilterSection>

            {/* Warranty Status */}
            <FilterSection
              title="Warranty Status"
              isExpanded={expandedSections.warranty}
              onToggle={() => toggleSection('warranty')}
            >
              <View style={styles.chipContainer}>
                {['Valid', 'Expired', 'Expiring Soon'].map((status) => 
                  renderChip(
                    status,
                    localFilters.warrantyStatus === status,
                    () => setLocalFilters(prev => ({
                      ...prev,
                      warrantyStatus: prev.warrantyStatus === status 
                        ? undefined 
                        : status as 'Valid' | 'Expired' | 'Expiring Soon',
                    }))
                  )
                )}
              </View>
            </FilterSection>

            {/* Receipt Type */}
            <FilterSection
              title="Receipt Type"
              isExpanded={expandedSections.receipt}
              onToggle={() => toggleSection('receipt')}
            >
              <View style={styles.chipContainer}>
                {['Cash', 'EFTPOS', 'Reimbursable', 'Statement Match'].map((type) => 
                  renderChip(
                    type,
                    localFilters.receiptType === type,
                    () => setLocalFilters(prev => ({
                      ...prev,
                      receiptType: prev.receiptType === type 
                        ? undefined 
                        : type as 'Cash' | 'EFTPOS' | 'Reimbursable' | 'Statement Match',
                    }))
                  )
                )}
              </View>
            </FilterSection>

            {/* Reimbursement Status */}
            <FilterSection
              title="Reimbursement Status"
              isExpanded={expandedSections.reimbursement}
              onToggle={() => toggleSection('reimbursement')}
            >
              <View style={styles.chipContainer}>
                {['Paid', 'Pending', 'Awaiting Approval'].map((status) => 
                  renderChip(
                    status,
                    localFilters.reimbursementStatus === status,
                    () => setLocalFilters(prev => ({
                      ...prev,
                      reimbursementStatus: prev.reimbursementStatus === status 
                        ? undefined 
                        : status as 'Paid' | 'Pending' | 'Awaiting Approval',
                    }))
                  )
                )}
              </View>
            </FilterSection>

            {/* Job Site */}
            <FilterSection
              title="Job Site"
              isExpanded={expandedSections.jobSite}
              onToggle={() => toggleSection('jobSite')}
            >
              <View style={styles.chipContainer}>
                {jobSiteOptions.map((site) => 
                  renderChip(
                    site,
                    localFilters.jobSite === site,
                    () => setLocalFilters(prev => ({
                      ...prev,
                      jobSite: prev.jobSite === site ? undefined : site,
                    }))
                  )
                )}
              </View>
            </FilterSection>

            {/* Subscription */}
            <FilterSection
              title="Subscription"
              isExpanded={expandedSections.subscription}
              onToggle={() => toggleSection('subscription')}
            >
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Recurring Vendor</Text>
                <Switch
                  value={localFilters.subscription || false}
                  onValueChange={(value) => 
                    setLocalFilters(prev => ({
                      ...prev,
                      subscription: value,
                    }))
                  }
                  trackColor={{
                    false: theme.colors.surfaceLight,
                    true: theme.colors.accent.primary,
                  }}
                  thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : theme.colors.background}
                />
              </View>
            </FilterSection>
          </ScrollView>
          
          {/* Apply Button */}
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.8}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};