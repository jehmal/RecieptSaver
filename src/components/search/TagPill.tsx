import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TagPillProps {
  label: string;
  type?: 'business' | 'personal' | 'tax-deductible' | 'reimbursable' | 'custom';
  onPress?: () => void;
}

const TagPill: React.FC<TagPillProps> = ({ label, type = 'custom', onPress }) => {
  // Color mapping based on tag type
  const getTagColor = () => {
    switch (type) {
      case 'business':
        return '#007AFF'; // Blue
      case 'personal':
        return '#34C759'; // Green
      case 'tax-deductible':
        return '#AF52DE'; // Purple
      case 'reimbursable':
        return '#FF9500'; // Orange
      case 'custom':
      default:
        return '#8E8E93'; // Gray
    }
  };

  const pillColor = getTagColor();

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.tagPill, { backgroundColor: pillColor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Text style={styles.tagText}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.tagPill, { backgroundColor: pillColor }]}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tagPill: {
    height: 24,
    paddingHorizontal: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TagPill;