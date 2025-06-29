import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface WebCameraProps {
  onCapture: (imageData: string) => void;
  onClose: () => void;
  isFlashOn: boolean;
  onToggleFlash: () => void;
}

const WebCamera: React.FC<WebCameraProps> = ({ 
  onCapture, 
  onClose, 
  isFlashOn, 
  onToggleFlash 
}) => {
  const { theme } = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Request camera permissions
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'environment', // Use back camera if available
          },
          audio: false,
        });

        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasPermission(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError(err instanceof Error ? err.message : 'Failed to access camera');
        setHasPermission(false);
        setIsLoading(false);
      }
    };

    initCamera();

    // Cleanup on unmount
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle capture
  const handleCapture = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Apply flash effect if enabled
        if (isFlashOn) {
          context.fillStyle = 'white';
          context.fillRect(0, 0, canvas.width, canvas.height);
          setTimeout(() => {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/jpeg', 0.8);
            onCapture(imageData);
          }, 50);
        } else {
          // Draw video frame to canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = canvas.toDataURL('image/jpeg', 0.8);
          onCapture(imageData);
        }
      }
    }
  }, [isFlashOn, onCapture]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
    },
    videoContainer: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    },
    video: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    canvas: {
      position: 'absolute',
      top: -9999,
      left: -9999,
    },
    controls: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
      paddingTop: 48,
    },
    controlButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    captureContainer: {
      position: 'absolute',
      bottom: 32,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    captureButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surface,
      padding: 4,
      ...theme.shadows.lg,
    },
    captureButtonInner: {
      flex: 1,
      borderRadius: 36,
      backgroundColor: theme.colors.accent.primary,
      borderWidth: 2,
      borderColor: theme.colors.card.border,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 32,
    },
    errorText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    errorSubtext: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent.primary} />
          <Text style={styles.loadingText}>Initializing camera...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false || error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="camera-off" size={64} color={theme.colors.text.secondary} />
          <Text style={styles.errorText}>Camera Access Required</Text>
          <Text style={styles.errorSubtext}>
            {error || 'Please grant camera permissions to use this feature. Check your browser settings and reload the page.'}
          </Text>
          <TouchableOpacity 
            style={[styles.controlButton, { marginTop: 24 }]} 
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        <video
          ref={videoRef}
          style={styles.video as any}
          autoPlay
          playsInline
          muted
        />
        <canvas ref={canvasRef} style={styles.canvas as any} />
      </View>

      {/* Top Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={onToggleFlash}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFlashOn ? 'flash' : 'flash-off'}
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Capture Button */}
      <View style={styles.captureContainer}>
        <TouchableOpacity
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          <View style={styles.captureButton}>
            <View style={styles.captureButtonInner} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default WebCamera;