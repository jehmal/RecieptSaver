import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface FilterPillsProps {
  selectedFilters: string[];
  onFilterSelect: (filter: string) => void;
  availableTags?: string[];
}

const defaultTimeFilters = ['Today', 'This Week', 'This Month', 'All Time'];

export const FilterPills: React.FC<FilterPillsProps> = ({
  selectedFilters,
  onFilterSelect,
  availableTags = [],
}) => {
  const { theme } = useTheme();
  const allFilters = [...defaultTimeFilters, ...availableTags];

  const isSelected = (filter: string) => selectedFilters.includes(filter);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingVertical: 8,
    },
    scrollContent: {
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pill: {
      height: 36,
      paddingHorizontal: 12,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    selectedPill: {
      backgroundColor: theme.colors.text.primary,
    },
    pillText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text.primary,
      ...Platform.select({
        ios: {
          fontFamily: 'System',
        },
        android: {
          fontFamily: 'Roboto',
        },
      }),
    },
    selectedPillText: {
      color: theme.colors.background,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allFilters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => onFilterSelect(filter)}
            style={[
              styles.pill,
              isSelected(filter) && styles.selectedPill,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                isSelected(filter) && styles.selectedPillText,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};