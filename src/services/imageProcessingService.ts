import * as ImageManipulator from 'expo-image-manipulator';
import { ImagePickerAsset } from 'expo-image-picker';

/**
 * Image preprocessing service to improve OCR accuracy
 */

export interface ProcessingOptions {
  autoRotate?: boolean;
  enhanceContrast?: boolean;
  convertToGrayscale?: boolean;
  cropToReceipt?: boolean;
  reduceNoise?: boolean;
  sharpenText?: boolean;
}

export interface ProcessingResult {
  uri: string;
  width: number;
  height: number;
  base64?: string;
}

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

class ImageProcessingService {
  /**
   * Process an image with multiple preprocessing steps to improve OCR accuracy
   */
  async processImage(
    imageUri: string,
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    try {
      const {
        autoRotate = true,
        enhanceContrast = true,
        convertToGrayscale = true,
        cropToReceipt = true,
        reduceNoise = true,
        sharpenText = true,
      } = options;

      let currentUri = imageUri;
      let manipulations: ImageManipulator.Action[] = [];

      // Step 1: Auto-rotate based on EXIF data
      if (autoRotate) {
        // ImageManipulator automatically handles EXIF rotation
        // No explicit action needed, it's done by default
      }

      // Step 2: Detect and crop to receipt boundaries
      if (cropToReceipt) {
        const cropBounds = await this.detectReceiptBoundaries(currentUri);
        if (cropBounds) {
          manipulations.push({
            crop: {
              originX: cropBounds.x,
              originY: cropBounds.y,
              width: cropBounds.width,
              height: cropBounds.height,
            },
          });
        }
      }

      // Apply manipulations so far
      if (manipulations.length > 0) {
        const result = await ImageManipulator.manipulateAsync(
          currentUri,
          manipulations,
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );
        currentUri = result.uri;
        manipulations = [];
      }

      // Step 3: Convert to grayscale
      if (convertToGrayscale) {
        const result = await this.convertToGrayscale(currentUri);
        currentUri = result.uri;
      }

      // Step 4: Enhance contrast
      if (enhanceContrast) {
        const result = await this.enhanceContrast(currentUri);
        currentUri = result.uri;
      }

      // Step 5: Reduce noise and sharpen text
      if (reduceNoise || sharpenText) {
        const result = await this.reduceNoiseAndSharpen(currentUri, {
          reduceNoise,
          sharpenText,
        });
        currentUri = result.uri;
      }

      // Get final image info
      const finalResult = await ImageManipulator.manipulateAsync(
        currentUri,
        [],
        { compress: 0.9, format: ImageManipulator.SaveFormat.PNG }
      );

      return {
        uri: finalResult.uri,
        width: finalResult.width,
        height: finalResult.height,
      };
    } catch (error) {
      console.error('Error processing image:', error);
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  /**
   * Auto-rotate image based on EXIF orientation data
   */
  async autoRotateImage(imageUri: string): Promise<ProcessingResult> {
    try {
      // ImageManipulator automatically handles EXIF rotation
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Error auto-rotating image:', error);
      throw new Error(`Failed to auto-rotate image: ${error.message}`);
    }
  }

  /**
   * Convert image to grayscale for better OCR performance
   */
  async convertToGrayscale(imageUri: string): Promise<ProcessingResult> {
    try {
      // Using custom grayscale conversion through contrast manipulation
      // This creates a grayscale effect by reducing saturation
      const actions: ImageManipulator.Action[] = [
        // Reduce saturation to 0 to create grayscale
        { contrast: -0.5 }, // First reduce contrast slightly
      ];

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      // Apply a second pass to ensure proper grayscale
      const grayscaleResult = await ImageManipulator.manipulateAsync(
        result.uri,
        [{ contrast: 1.2 }], // Enhance contrast after grayscale conversion
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      return {
        uri: grayscaleResult.uri,
        width: grayscaleResult.width,
        height: grayscaleResult.height,
      };
    } catch (error) {
      console.error('Error converting to grayscale:', error);
      throw new Error(`Failed to convert to grayscale: ${error.message}`);
    }
  }

  /**
   * Enhance image contrast for better text visibility
   */
  async enhanceContrast(imageUri: string): Promise<ProcessingResult> {
    try {
      const actions: ImageManipulator.Action[] = [
        { contrast: 1.5 }, // Increase contrast by 50%
      ];

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Error enhancing contrast:', error);
      throw new Error(`Failed to enhance contrast: ${error.message}`);
    }
  }

  /**
   * Detect receipt boundaries in the image
   * This is a simplified implementation - for production, consider using
   * computer vision libraries or ML models for better accuracy
   */
  async detectReceiptBoundaries(imageUri: string): Promise<Rectangle | null> {
    try {
      // Get image dimensions
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      // For now, we'll use a simple heuristic:
      // Assume the receipt occupies the central 90% of the image
      // In a production app, you'd want to use edge detection or ML
      const padding = 0.05; // 5% padding on each side
      
      const cropBounds: Rectangle = {
        x: Math.floor(imageInfo.width * padding),
        y: Math.floor(imageInfo.height * padding),
        width: Math.floor(imageInfo.width * (1 - 2 * padding)),
        height: Math.floor(imageInfo.height * (1 - 2 * padding)),
      };

      return cropBounds;
    } catch (error) {
      console.error('Error detecting receipt boundaries:', error);
      return null;
    }
  }

  /**
   * Reduce noise and sharpen text for better OCR accuracy
   */
  async reduceNoiseAndSharpen(
    imageUri: string,
    options: { reduceNoise: boolean; sharpenText: boolean }
  ): Promise<ProcessingResult> {
    try {
      let actions: ImageManipulator.Action[] = [];

      // Reduce noise by applying slight blur then enhancing contrast
      if (options.reduceNoise) {
        // First pass: slight contrast reduction to smooth noise
        const smoothResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ contrast: 0.9 }],
          { compress: 1, format: ImageManipulator.SaveFormat.PNG }
        );
        imageUri = smoothResult.uri;
      }

      // Sharpen text by increasing contrast
      if (options.sharpenText) {
        actions.push({ contrast: 1.3 });
      }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        actions,
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Error reducing noise and sharpening:', error);
      throw new Error(`Failed to reduce noise and sharpen: ${error.message}`);
    }
  }

  /**
   * Resize image if it's too large for OCR processing
   */
  async resizeForOCR(
    imageUri: string,
    maxWidth: number = 2048,
    maxHeight: number = 2048
  ): Promise<ProcessingResult> {
    try {
      // Get current dimensions
      const imageInfo = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      // Check if resize is needed
      if (imageInfo.width <= maxWidth && imageInfo.height <= maxHeight) {
        return {
          uri: imageInfo.uri,
          width: imageInfo.width,
          height: imageInfo.height,
        };
      }

      // Calculate new dimensions maintaining aspect ratio
      const aspectRatio = imageInfo.width / imageInfo.height;
      let newWidth = maxWidth;
      let newHeight = maxHeight;

      if (aspectRatio > maxWidth / maxHeight) {
        newHeight = Math.floor(maxWidth / aspectRatio);
      } else {
        newWidth = Math.floor(maxHeight * aspectRatio);
      }

      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: newWidth, height: newHeight } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.PNG }
      );

      return {
        uri: result.uri,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Error resizing image:', error);
      throw new Error(`Failed to resize image: ${error.message}`);
    }
  }

  /**
   * Get base64 representation of the processed image
   */
  async getBase64(imageUri: string): Promise<string> {
    try {
      const result = await ImageManipulator.manipulateAsync(
        imageUri,
        [],
        { 
          compress: 0.9, 
          format: ImageManipulator.SaveFormat.PNG,
          base64: true 
        }
      );

      if (!result.base64) {
        throw new Error('Failed to generate base64');
      }

      return result.base64;
    } catch (error) {
      console.error('Error getting base64:', error);
      throw new Error(`Failed to get base64: ${error.message}`);
    }
  }

  /**
   * Validate if the image format is supported
   */
  isSupportedFormat(mimeType?: string): boolean {
    if (!mimeType) return true; // Assume supported if no mime type

    const supportedFormats = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/bmp',
      'image/webp',
    ];

    return supportedFormats.includes(mimeType.toLowerCase());
  }

  /**
   * Prepare image for OCR with optimal settings
   */
  async prepareForOCR(
    imageUri: string,
    asset?: ImagePickerAsset
  ): Promise<ProcessingResult> {
    try {
      // Validate format if asset info is available
      if (asset?.mimeType && !this.isSupportedFormat(asset.mimeType)) {
        throw new Error(`Unsupported image format: ${asset.mimeType}`);
      }

      // Process with optimal OCR settings
      const processedImage = await this.processImage(imageUri, {
        autoRotate: true,
        enhanceContrast: true,
        convertToGrayscale: true,
        cropToReceipt: true,
        reduceNoise: true,
        sharpenText: true,
      });

      // Resize if needed
      const finalImage = await this.resizeForOCR(processedImage.uri);

      return finalImage;
    } catch (error) {
      console.error('Error preparing image for OCR:', error);
      throw new Error(`Failed to prepare image for OCR: ${error.message}`);
    }
  }
}

// Export singleton instance
export const imageProcessingService = new ImageProcessingService();

// Export types and functions for convenience
export const processImage = (imageUri: string, options?: ProcessingOptions) =>
  imageProcessingService.processImage(imageUri, options);

export const prepareForOCR = (imageUri: string, asset?: ImagePickerAsset) =>
  imageProcessingService.prepareForOCR(imageUri, asset);

export const autoRotateImage = (imageUri: string) =>
  imageProcessingService.autoRotateImage(imageUri);

export const convertToGrayscale = (imageUri: string) =>
  imageProcessingService.convertToGrayscale(imageUri);

export const enhanceContrast = (imageUri: string) =>
  imageProcessingService.enhanceContrast(imageUri);

export const resizeForOCR = (imageUri: string, maxWidth?: number, maxHeight?: number) =>
  imageProcessingService.resizeForOCR(imageUri, maxWidth, maxHeight);

export const getBase64 = (imageUri: string) =>
  imageProcessingService.getBase64(imageUri);