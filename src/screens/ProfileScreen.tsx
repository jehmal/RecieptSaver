import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { AppearanceModal } from '../components/AppearanceModal';

const ProfileScreen: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const navigation = useNavigation<any>();
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    title: {
      ...theme.typography.h1,
      color: theme.colors.text.primary,
    },
    settingsButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.sm,
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.colors.card.border,
      marginBottom: theme.spacing.md,
    },
    name: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    email: {
      ...theme.typography.body,
      color: theme.colors.text.secondary,
    },
    statsContainer: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.colors.card.background,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    statValue: {
      ...theme.typography.h2,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.xs,
    },
    statLabel: {
      ...theme.typography.bodySmall,
      color: theme.colors.text.secondary,
    },
    menuSection: {
      paddingHorizontal: theme.spacing.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.card.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.sm,
    },
    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    menuText: {
      ...theme.typography.body,
      color: theme.colors.text.primary,
    },
    logoutItem: {
      marginTop: theme.spacing.lg,
    },
    logoutText: {
      color: theme.colors.accent.error,
    },
  });
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/120x120/E5E5EA/8E8E93?text=User' }}
            style={styles.profileImage}
          />
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2,348</Text>
            <Text style={styles.statLabel}>Total Receipts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>$24.7K</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => setShowAppearanceModal(true)}>
            <View style={styles.menuLeft}>
              <Ionicons name="color-palette-outline" size={24} color={theme.colors.text.primary} />
              <Text style={styles.menuText}>Appearance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="receipt-outline" size={24} color={theme.colors.text.primary} />
              <Text style={styles.menuText}>Export Receipts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="card-outline" size={24} color={theme.colors.text.primary} />
              <Text style={styles.menuText}>Payment Methods</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text.primary} />
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={24} color={theme.colors.text.primary} />
              <Text style={styles.menuText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.logoutItem]}>
            <View style={styles.menuLeft}>
              <Ionicons name="log-out-outline" size={24} color={theme.colors.accent.error} />
              <Text style={[styles.menuText, styles.logoutText]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      <AppearanceModal
        visible={showAppearanceModal}
        onClose={() => setShowAppearanceModal(false)}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;