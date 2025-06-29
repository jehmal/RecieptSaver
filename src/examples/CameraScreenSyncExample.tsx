import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useSync } from '../contexts/SyncContext';
import { useSyncActions, useSyncStatus } from '../hooks/useSync';
import { OfflineBanner } from '../components/sync/OfflineBanner';

interface CameraSyncIntegrationProps {
  onCapture: (photoUri: string) => void;
}

export const CameraSyncIntegration: React.FC<CameraSyncIntegrationProps> = ({ onCapture }) => {
  const { theme } = useTheme();
  const { addToSyncQueue } = useSync();
  const { syncReceipt } = useSyncActions();
  const { status: globalSyncStatus } = useSyncStatus();
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastCapturedReceipt, setLastCapturedReceipt] = useState<any>(null);

  const handlePhotoCapture = async (photoUri: string) => {
    setIsSaving(true);
    
    try {
      // Process the photo (OCR, etc.)
      const receiptData = {
        id: Date.now().toString(),
        photoUri,
        timestamp: new Date(),
        // ... other receipt data
      };
      
      setLastCapturedReceipt(receiptData);
      
      // Try to sync immediately
      const syncResult = await syncReceipt(receiptData);
      
      if (!syncResult.success) {
        // If offline or sync failed, it's already queued
        console.log('Receipt queued for sync:', syncResult.queued);
      }
      
      onCapture(photoUri);
    } catch (error) {
      console.error('Error processing receipt:', error);
      
      // Still queue for sync even if processing failed
      addToSyncQueue({
        type: 'receipt',
        data: { photoUri, error: error.message },
        priority: 'high',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Offline banner specifically for camera screen */}
      <OfflineBanner position="top" showNetworkType={false} />
      
      {/* Sync status indicator */}
      {isSaving && (
        <View style={[styles.savingOverlay, { backgroundColor: theme.colors.background + 'E6' }]}>
          <ActivityIndicator size="large" color={theme.colors.accent.primary} />
          <Text style={[styles.savingText, { color: theme.colors.text.primary }]}>
            Processing receipt...
          </Text>
        </View>
      )}
      
      {/* Last captured receipt sync status */}
      {lastCapturedReceipt && (
        <View style={[styles.lastReceiptStatus, { backgroundColor: theme.colors.surface }]}>
          <ReceiptSyncStatusIndicator receiptId={lastCapturedReceipt.id} />
        </View>
      )}
    </View>
  );
};

interface ReceiptSyncStatusIndicatorProps {
  receiptId: string;
}

const ReceiptSyncStatusIndicator: React.FC<ReceiptSyncStatusIndicatorProps> = ({ receiptId }) => {
  const { theme } = useTheme();
  const { status, progress } = useSyncStatus(receiptId);
  
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: 'checkmark-circle',
          text: 'Receipt saved',
          color: theme.colors.accent.success,
        };
      case 'syncing':
        return {
          icon: 'sync',
          text: `Syncing... ${progress || 0}%`,
          color: theme.colors.accent.primary,
        };
      case 'pending':
        return {
          icon: 'time',
          text: 'Waiting to sync',
          color: theme.colors.accent.warning,
        };
      case 'error':
        return {
          icon: 'alert-circle',
          text: 'Sync failed',
          color: theme.colors.accent.error,
        };
      default:
        return {
          icon: 'cloud-offline',
          text: 'Offline',
          color: theme.colors.text.secondary,
        };
    }
  };
  
  const config = getStatusConfig();
  
  return (
    <View style={styles.statusContainer}>
      <Ionicons name={config.icon as any} size={20} color={config.color} />
      <Text style={[styles.statusText, { color: theme.colors.text.primary }]}>
        {config.text}
      </Text>
    </View>
  );
};

// Example of how to use in actual CameraScreen
export const CameraScreenWithSync: React.FC = () => {
  const { theme } = useTheme();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  
  return (
    <View style={[styles.cameraContainer, { backgroundColor: theme.colors.background }]}>
      {/* Camera view component */}
      {/* ... */}
      
      {/* Sync integration overlay */}
      <CameraSyncIntegration 
        onCapture={(uri) => {
          setPhotoUri(uri);
          // Navigate to receipt detail or gallery
        }}
      />
      
      {/* Capture button with sync state */}
      <TouchableOpacity 
        style={[styles.captureButton, { backgroundColor: theme.colors.accent.primary }]}
        onPress={() => {/* Capture photo */}}
      >
        <Ionicons name="camera" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  savingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'auto',
  },
  savingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  lastReceiptStatus: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cameraContainer: {
    flex: 1,
  },
  captureButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});