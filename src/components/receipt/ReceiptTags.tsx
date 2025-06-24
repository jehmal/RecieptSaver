import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface Tag {
  id: string;
  label: string;
  isSelected: boolean;
}

interface ReceiptTagsProps {
  tags: Tag[];
  onTagPress: (tagId: string) => void;
  onAddTag: () => void;
}

const ReceiptTags: React.FC<ReceiptTagsProps> = ({ tags, onTagPress, onAddTag }) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    container: {
      marginTop: 24,
      paddingLeft: 20,
    },
    sectionHeader: {
      fontSize: 13,
      color: theme.colors.text.secondary,
      fontWeight: '500',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    tagContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
      paddingRight: 20,
    },
    tagPill: {
      height: 32,
      paddingHorizontal: 16,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    tagPillSelected: {
      backgroundColor: theme.colors.accent.primary,
    },
    tagPillUnselected: {
      backgroundColor: theme.colors.surfaceLight,
    },
    tagText: {
      fontSize: 15,
      fontWeight: '500',
    },
    tagTextSelected: {
      color: theme.colors.background,
    },
    tagTextUnselected: {
      color: theme.colors.text.primary,
    },
    addTagButton: {
      marginLeft: 4,
    },
  });
  return (
    <View style={styles.container}>
      <Text style={styles.sectionHeader}>TAGS</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagContainer}
      >
        {tags.map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tagPill,
              tag.isSelected ? styles.tagPillSelected : styles.tagPillUnselected,
            ]}
            onPress={() => onTagPress(tag.id)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tagText,
                tag.isSelected ? styles.tagTextSelected : styles.tagTextUnselected,
              ]}
            >
              {tag.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.addTagButton}
          onPress={onAddTag}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={32} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default ReceiptTags;