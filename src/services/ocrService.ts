import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface OCRResult {
  text: string;
  merchantName?: string;
  date?: string;
  totalAmount?: number;
  items?: Array<{
    name: string;
    price: number;
    quantity?: number;
  }>;
  confidence: number;
  rawData?: any;
}

export interface OCRError {
  code: string;
  message: string;
}

class OCRService {
  private static instance: OCRService;
  
  private constructor() {}
  
  static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  /**
   * Process an image and extract text using OCR
   * @param imageUri The URI of the image to process (can be file path or base64 data URL)
   * @returns OCR results including extracted text and parsed receipt data
   */
  async processImage(imageUri: string): Promise<OCRResult> {
    try {
      // Handle base64 data URLs from web camera
      if (Platform.OS === 'web' && imageUri.startsWith('data:image')) {
        // For web platform with base64 images, we can still process them
        // In production, send the base64 directly to the OCR API
        const mockResult = await this.mockOCRProcessing(imageUri);
        return mockResult;
      }
      
      // For now, we'll use a mock implementation
      // In production, this would call Google Vision API or another OCR service
      const mockResult = await this.mockOCRProcessing(imageUri);
      return mockResult;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process image with Google Vision API (future implementation)
   * @param imageUri The URI of the image to process
   * @returns OCR results from Google Vision API
   */
  private async processWithGoogleVision(imageUri: string): Promise<OCRResult> {
    let base64Image: string;
    
    if (Platform.OS === 'web' && imageUri.startsWith('data:image')) {
      // Extract base64 from data URL
      base64Image = imageUri.replace(/^data:image\/\w+;base64,/, '');
    } else {
      // Convert image file to base64
      base64Image = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    // TODO: Implement actual Google Vision API call
    // This would require:
    // 1. API key management (stored securely)
    // 2. Network request to Google Vision API
    // 3. Response parsing

    const apiKey = process.env.GOOGLE_VISION_API_KEY;
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    // Placeholder for actual implementation
    throw new Error('Google Vision API integration not yet implemented');
  }

  /**
   * Mock OCR processing for development
   * @param imageUri The URI of the image to process
   * @returns Mock OCR results
   */
  private async mockOCRProcessing(imageUri: string): Promise<OCRResult> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Generate mock receipt data
    const merchants = ['Walmart', 'Target', 'Whole Foods', 'Costco', 'Home Depot'];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    
    const items = [
      { name: 'Organic Apples', price: 5.99, quantity: 1 },
      { name: 'Milk 2%', price: 3.49, quantity: 2 },
      { name: 'Bread Whole Wheat', price: 2.99, quantity: 1 },
      { name: 'Chicken Breast', price: 12.99, quantity: 1 },
      { name: 'Paper Towels', price: 15.99, quantity: 1 },
    ];

    const selectedItems = items.slice(0, Math.floor(Math.random() * 3) + 2);
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
    const tax = subtotal * 0.08;
    const total = subtotal + tax;

    return {
      text: this.generateMockReceiptText(merchant, selectedItems, subtotal, tax, total),
      merchantName: merchant,
      date: new Date().toISOString(),
      totalAmount: parseFloat(total.toFixed(2)),
      items: selectedItems,
      confidence: 0.95,
      rawData: {
        imageUri,
        processedAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Generate mock receipt text
   */
  private generateMockReceiptText(
    merchant: string,
    items: Array<{ name: string; price: number; quantity?: number }>,
    subtotal: number,
    tax: number,
    total: number
  ): string {
    let text = `${merchant.toUpperCase()}\n`;
    text += `${new Date().toLocaleDateString()}\n\n`;
    text += 'RECEIPT\n\n';
    
    items.forEach(item => {
      text += `${item.name} ${item.quantity ? `x${item.quantity}` : ''} $${item.price.toFixed(2)}\n`;
    });
    
    text += `\nSUBTOTAL: $${subtotal.toFixed(2)}\n`;
    text += `TAX: $${tax.toFixed(2)}\n`;
    text += `TOTAL: $${total.toFixed(2)}\n`;
    
    return text;
  }

  /**
   * Parse extracted text to identify receipt components
   * @param text Raw text extracted from OCR
   * @returns Parsed receipt data
   */
  parseReceiptText(text: string): Partial<OCRResult> {
    // This is a simplified parser
    // In production, use more sophisticated NLP or regex patterns
    
    const lines = text.split('\n').filter(line => line.trim());
    let merchantName = '';
    let totalAmount = 0;
    let date = '';

    // Try to extract merchant name (usually first line)
    if (lines.length > 0) {
      merchantName = lines[0].trim();
    }

    // Look for total amount
    const totalRegex = /TOTAL:?\s*\$?([0-9]+\.?[0-9]*)/i;
    for (const line of lines) {
      const match = line.match(totalRegex);
      if (match) {
        totalAmount = parseFloat(match[1]);
        break;
      }
    }

    // Look for date patterns
    const dateRegex = /(\d{1,2}\/\d{1,2}\/\d{2,4})/;
    for (const line of lines) {
      const match = line.match(dateRegex);
      if (match) {
        date = match[1];
        break;
      }
    }

    return {
      merchantName,
      totalAmount,
      date,
    };
  }

  /**
   * Preprocess image for better OCR results
   * @param imageUri The URI of the image to preprocess
   * @returns URI of the preprocessed image
   */
  async preprocessImage(imageUri: string): Promise<string> {
    // In a real implementation, this would:
    // 1. Apply image filters (contrast, brightness)
    // 2. Deskew the image
    // 3. Remove noise
    // 4. Convert to grayscale
    // 5. Apply edge detection
    
    // For now, return the original image
    return imageUri;
  }

  /**
   * Validate OCR results
   * @param result OCR result to validate
   * @returns Whether the result is valid
   */
  validateResult(result: OCRResult): boolean {
    // Basic validation
    if (!result.text || result.text.trim().length < 10) {
      return false;
    }

    if (result.confidence < 0.5) {
      return false;
    }

    // Check if essential fields are present
    if (!result.merchantName && !result.totalAmount) {
      return false;
    }

    return true;
  }

  /**
   * Handle and format errors
   * @param error The error to handle
   * @returns Formatted OCR error
   */
  private handleError(error: any): OCRError {
    if (error.code === 'NETWORK_ERROR') {
      return {
        code: 'OCR_NETWORK_ERROR',
        message: 'Unable to connect to OCR service. Please check your internet connection.',
      };
    }

    if (error.code === 'INVALID_IMAGE') {
      return {
        code: 'OCR_INVALID_IMAGE',
        message: 'The image format is not supported or the image is corrupted.',
      };
    }

    return {
      code: 'OCR_UNKNOWN_ERROR',
      message: 'An unexpected error occurred while processing the image.',
    };
  }
}

export default OCRService.getInstance();