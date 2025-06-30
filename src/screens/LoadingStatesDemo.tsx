import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import {
  ActivityLoader,
  SkeletonLoader,
  SkeletonText,
  ReceiptCardSkeleton,
  ReceiptListItemSkeleton,
  WarrantyCardSkeleton,
  WarrantyListItemSkeleton,
  ProgressBar,
  CircularProgress,
  EmptyState,
  ErrorState,
  LoadingState,
  PullToRefreshIndicator,
  FileUploadProgress,
  BatchUploadProgress,
  SyncProgressIndicator,
  CompactSyncIndicator,
} from '../components/loading';

export const LoadingStatesDemo: React.FC = () => {
  const { theme } = useTheme();
  const [uploadProgress, setUploadProgress] = useState(0.3);
  const [syncProgress, setSyncProgress] = useState(0.6);
  const [pullProgress, setPullProgress] = useState(0);

  const mockUploads = [
    { id: '1', fileName: 'receipt_001.jpg', progress: 1, status: 'complete' as const },
    { id: '2', fileName: 'receipt_002.jpg', progress: 0.7, status: 'uploading' as const },
    { id: '3', fileName: 'receipt_003.jpg', progress: 0, status: 'pending' as const },
    { id: '4', fileName: 'receipt_004.jpg', progress: 0, status: 'error' as const },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Loading States Demo
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            All loading components in the Infinite app
          </Text>
        </View>

        {/* Activity Loaders */}
        <Section title="Activity Loaders">
          <DemoRow label="Small">
            <ActivityLoader size="small" />
          </DemoRow>
          <DemoRow label="Large with message">
            <ActivityLoader size="large" message="Loading data..." />
          </DemoRow>
        </Section>

        {/* Skeleton Loaders */}
        <Section title="Skeleton Loaders">
          <DemoRow label="Basic skeleton">
            <SkeletonLoader width={200} height={20} />
          </DemoRow>
          <DemoRow label="Text skeleton">
            <SkeletonText lines={3} />
          </DemoRow>
          <DemoRow label="Receipt card skeleton">
            <ReceiptCardSkeleton />
          </DemoRow>
          <DemoRow label="Receipt list item skeleton">
            <ReceiptListItemSkeleton />
          </DemoRow>
          <DemoRow label="Warranty card skeleton">
            <WarrantyCardSkeleton />
          </DemoRow>
          <DemoRow label="Warranty list item skeleton">
            <WarrantyListItemSkeleton />
          </DemoRow>
        </Section>

        {/* Progress Indicators */}
        <Section title="Progress Indicators">
          <DemoRow label="Progress bar">
            <View style={{ width: '100%' }}>
              <ProgressBar progress={uploadProgress} showPercentage />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.accent.primary }]}
                onPress={() => setUploadProgress(Math.random())}
              >
                <Text style={styles.buttonText}>Randomize</Text>
              </TouchableOpacity>
            </View>
          </DemoRow>
          <DemoRow label="Circular progress">
            <CircularProgress progress={syncProgress} />
          </DemoRow>
        </Section>

        {/* File Upload Progress */}
        <Section title="File Upload Progress">
          <DemoRow label="Single file upload">
            <FileUploadProgress
              fileName="receipt_scan.jpg"
              progress={0.75}
              status="uploading"
              onCancel={() => console.log('Cancel')}
            />
          </DemoRow>
          <DemoRow label="Processing file">
            <FileUploadProgress
              fileName="receipt_scan.jpg"
              progress={0.95}
              status="processing"
            />
          </DemoRow>
          <DemoRow label="Upload complete">
            <FileUploadProgress
              fileName="receipt_scan.jpg"
              progress={1}
              status="complete"
            />
          </DemoRow>
          <DemoRow label="Upload error">
            <FileUploadProgress
              fileName="receipt_scan.jpg"
              progress={0.4}
              status="error"
              error="Network connection failed"
              onRetry={() => console.log('Retry')}
            />
          </DemoRow>
          <DemoRow label="Batch upload">
            <BatchUploadProgress
              uploads={mockUploads}
              onCancelAll={() => console.log('Cancel all')}
            />
          </DemoRow>
        </Section>

        {/* Sync Progress */}
        <Section title="Sync Progress">
          <DemoRow label="Sync indicator">
            <SyncProgressIndicator
              totalItems={10}
              syncedItems={6}
              status="syncing"
            />
          </DemoRow>
          <DemoRow label="Sync complete">
            <SyncProgressIndicator
              totalItems={10}
              syncedItems={10}
              status="complete"
            />
          </DemoRow>
          <DemoRow label="Sync error">
            <SyncProgressIndicator
              totalItems={10}
              syncedItems={4}
              status="error"
              error="Connection lost"
            />
          </DemoRow>
          <DemoRow label="Compact sync indicators">
            <View style={styles.compactRow}>
              <CompactSyncIndicator isSyncing={false} hasChanges={false} />
              <CompactSyncIndicator isSyncing={false} hasChanges={true} />
              <CompactSyncIndicator isSyncing={true} hasChanges={false} />
            </View>
          </DemoRow>
        </Section>

        {/* State Components */}
        <Section title="State Components">
          <DemoRow label="Empty state">
            <EmptyState
              icon="folder-open"
              title="No receipts yet"
              message="Start by taking a photo of your first receipt"
            />
          </DemoRow>
          <DemoRow label="Error state">
            <ErrorState
              error="Unable to connect to server"
              onRetry={() => console.log('Retry')}
            />
          </DemoRow>
          <DemoRow label="Loading state">
            <LoadingState message="Fetching your data..." />
          </DemoRow>
        </Section>

        {/* Pull to Refresh */}
        <Section title="Pull to Refresh">
          <DemoRow label="Pull indicator">
            <View>
              <PullToRefreshIndicator
                pullProgress={pullProgress}
                isRefreshing={false}
              />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.colors.accent.primary }]}
                onPress={() => setPullProgress((pullProgress + 0.2) % 1.2)}
              >
                <Text style={styles.buttonText}>Simulate Pull</Text>
              </TouchableOpacity>
            </View>
          </DemoRow>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        {title}
      </Text>
      {children}
    </View>
  );
};

const DemoRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => {
  const { theme } = useTheme();
  return (
    <View style={styles.demoRow}>
      <Text style={[styles.label, { color: theme.colors.text.secondary }]}>
        {label}
      </Text>
      <View style={styles.demoContent}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  demoRow: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  demoContent: {
    minHeight: 60,
    justifyContent: 'center',
  },
  button: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  compactRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'center',
  },
});