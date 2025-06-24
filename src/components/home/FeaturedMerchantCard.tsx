import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');

interface FeaturedMerchantCardProps {
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  gradientColors?: string[];
  onPress?: () => void;
}

const FeaturedMerchantCard: React.FC<FeaturedMerchantCardProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  gradientColors = ['#007AFF', '#34C759'],
  onPress,
}) => {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      height: 240,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
      borderRadius: theme.borderRadius.xl,
      overflow: 'hidden',
      ...theme.shadows.lg,
    },
    imageBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
    },
    image: {
      borderRadius: theme.borderRadius.xl,
      opacity: 0.3,
    },
    gradientOverlay: {
      flex: 1,
      padding: theme.spacing.lg,
      justifyContent: 'space-between',
    },
    content: {
      flex: 1,
      justifyContent: 'space-between',
    },
    topSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    subtitle: {
      ...theme.typography.label,
      color: theme.colors.text.primary,
      opacity: 0.9,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bottomSection: {
      gap: theme.spacing.sm,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    description: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
      opacity: 0.9,
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.95}
      onPress={onPress}
    >
      <ImageBackground
        source={{ uri: imageUrl }}
        style={styles.imageBackground}
        imageStyle={styles.image}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        >
          <View style={styles.content}>
            <View style={styles.topSection}>
              <Text style={styles.subtitle}>{subtitle}</Text>
              <View style={styles.iconContainer}>
                <Ionicons 
                  name="arrow-forward" 
                  size={24} 
                  color={theme.colors.text.primary}
                />
              </View>
            </View>
            
            <View style={styles.bottomSection}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.description}>{description}</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default FeaturedMerchantCard;