import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { ProgressBar } from './ProgressBar';
import { MaterialIcons } from '@expo/vector-icons';

interface FileUploadProgressProps {
  fileName: string;
  progress: number; // 0 to 1
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

export const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  fileName,
  progress,
  status,
  error,
  onCancel,
  onRetry,
}) => {
  const { theme } = useTheme();

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return 'cloud-upload';
      case 'processing':
        return 'settings';
      case 'complete':
        return 'check-circle';
      case 'error':
        return 'error';
      default:
        return 'cloud-upload';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return theme.colors.accent.success;
      case 'error':
        return theme.colors.accent.error;
      default:
        return theme.colors.accent.primary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return `Uploading... ${Math.round(progress * 100)}%`;
      case 'processing':
        return 'Processing...';
      case 'complete':
        return 'Upload complete';
      case 'error':
        return error || 'Upload failed';
      default:
        return 'Preparing...';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card.background }]}>
      <View style={styles.header}>
        <MaterialIcons
          name={getStatusIcon()}
          size={24}
          color={getStatusColor()}
        />
        <View style={styles.fileInfo}>
          <Text 
            style={[styles.fileName, { color: theme.colors.text.primary }]}
            numberOfLines={1}
          >
            {fileName}
          </Text>
          <Text style={[styles.statusText, { color: theme.colors.text.secondary }]}>
            {getStatusText()}
          </Text>
        </View>
        {status === 'uploading' && onCancel && (
          <TouchableOpacity onPress={onCancel}>
            <MaterialIcons
              name="close"
              size={20}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
        {status === 'error' && onRetry && (
          <TouchableOpacity onPress={onRetry}>
            <MaterialIcons
              name="refresh"
              size={20}
              color={theme.colors.accent.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      {(status === 'uploading' || status === 'processing') && (
        <ProgressBar
          progress={status === 'processing' ? 0.95 : progress}
          animated
          color={getStatusColor()}
        />
      )}
    </View>
  );
};

interface BatchUploadProgressProps {
  uploads: Array<{
    id: string;
    fileName: string;
    progress: number;
    status: 'pending' | 'uploading' | 'complete' | 'error';
  }>;
  onCancelAll?: () => void;
}

export const BatchUploadProgress: React.FC<BatchUploadProgressProps> = ({
  uploads,
  onCancelAll,
}) => {
  const { theme } = useTheme();
  
  const completed = uploads.filter(u => u.status === 'complete').length;
  const failed = uploads.filter(u => u.status === 'error').length;
  const total = uploads.length;
  const overallProgress = completed / total;

  return (
    <View style={[styles.batchContainer, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.batchHeader}>
        <Text style={[styles.batchTitle, { color: theme.colors.text.primary }]}>
          Uploading {total} files
        </Text>
        {onCancelAll && (
          <TouchableOpacity onPress={onCancelAll}>
            <Text style={[styles.cancelAll, { color: theme.colors.accent.error }]}>
              Cancel All
            </Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.batchStats}>
        <Text style={[styles.statText, { color: theme.colors.text.secondary }]}>
          {completed} completed
        </Text>
        {failed > 0 && (
          <Text style={[styles.statText, { color: theme.colors.accent.error }]}>
            {failed} failed
          </Text>
        )}
      </View>

      <ProgressBar
        progress={overallProgress}
        showPercentage
        animated
      />

      <View style={styles.uploadsList}>
        {uploads.slice(0, 3).map(upload => (
          <View key={upload.id} style={styles.uploadItem}>
            <Text 
              style={[styles.uploadFileName, { color: theme.colors.text.secondary }]}
              numberOfLines={1}
            >
              {upload.fileName}
            </Text>
            <MaterialIcons
              name={
                upload.status === 'complete' ? 'check-circle' :
                upload.status === 'error' ? 'error' :
                upload.status === 'uploading' ? 'cloud-upload' : 'schedule'
              }
              size={16}
              color={
                upload.status === 'complete' ? theme.colors.accent.success :
                upload.status === 'error' ? theme.colors.accent.error :
                theme.colors.text.tertiary
              }
            />
          </View>
        ))}
        {uploads.length > 3 && (
          <Text style={[styles.moreFiles, { color: theme.colors.text.tertiary }]}>
            +{uploads.length - 3} more files
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 14,
    marginTop: 2,
  },
  batchContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelAll: {
    fontSize: 14,
    fontWeight: '500',
  },
  batchStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statText: {
    fontSize: 14,
    marginRight: 16,
  },
  uploadsList: {
    marginTop: 16,
  },
  uploadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadFileName: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  moreFiles: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
});