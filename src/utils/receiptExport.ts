import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import { Receipt } from '../contexts/ReceiptContext';
import { format, parseISO } from 'date-fns';
import { formatCurrency } from './receiptHelpers';

// Generate HTML template for PDF export
const generateReceiptHTML = (receipt: Receipt): string => {
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'h:mm a');
    } catch {
      return '';
    }
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${receipt.merchant}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: white;
            color: #333;
          }
          .receipt-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
          }
          .merchant-name {
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 10px 0;
            color: #000;
          }
          .category {
            display: inline-block;
            background: #f0f0f0;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
            color: #666;
            margin-top: 10px;
          }
          .amount-section {
            text-align: center;
            margin: 40px 0;
            padding: 30px;
            background: #f8f8f8;
            border-radius: 8px;
          }
          .amount-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .amount {
            font-size: 48px;
            font-weight: 700;
            color: #000;
            margin: 0;
          }
          .details {
            margin: 30px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px solid #f0f0f0;
          }
          .detail-label {
            font-size: 14px;
            color: #666;
          }
          .detail-value {
            font-size: 16px;
            font-weight: 500;
            color: #000;
          }
          .tags {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 1px solid #f0f0f0;
          }
          .tags-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .tag {
            display: inline-block;
            background: #e3f2fd;
            color: #1976d2;
            padding: 5px 12px;
            border-radius: 16px;
            margin: 5px;
            font-size: 14px;
          }
          .notes {
            margin-top: 30px;
            padding: 20px;
            background: #f8f8f8;
            border-radius: 8px;
          }
          .notes-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .notes-text {
            font-size: 16px;
            color: #333;
            line-height: 1.5;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #999;
          }
          .receipt-image {
            width: 100%;
            max-width: 400px;
            margin: 30px auto;
            display: block;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1 class="merchant-name">${receipt.merchant}</h1>
            ${receipt.category ? `<span class="category">${receipt.category}</span>` : ''}
          </div>
          
          <div class="amount-section">
            <div class="amount-label">Total Amount</div>
            <div class="amount">${formatCurrency(receipt.amount)}</div>
          </div>
          
          ${receipt.imageUri ? `
            <img src="${receipt.imageUri}" alt="Receipt" class="receipt-image" />
          ` : ''}
          
          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Date</span>
              <span class="detail-value">${formatDate(receipt.date)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Time</span>
              <span class="detail-value">${formatTime(receipt.createdAt)}</span>
            </div>
            ${receipt.paymentMethod ? `
              <div class="detail-row">
                <span class="detail-label">Payment Method</span>
                <span class="detail-value">${receipt.paymentMethod}</span>
              </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Receipt ID</span>
              <span class="detail-value">${receipt.id}</span>
            </div>
          </div>
          
          ${receipt.tags && receipt.tags.length > 0 ? `
            <div class="tags">
              <div class="tags-label">Tags</div>
              ${receipt.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          
          ${receipt.notes ? `
            <div class="notes">
              <div class="notes-label">Notes</div>
              <div class="notes-text">${receipt.notes}</div>
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Generated on ${format(new Date(), 'PPP')}</p>
            <p>Infinite - Receipt Management</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

// Export receipt as PDF
export const exportReceiptAsPDF = async (receipt: Receipt): Promise<string | null> => {
  try {
    const html = generateReceiptHTML(receipt);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });
    
    // Move to a more permanent location with a better filename
    const fileName = `receipt_${receipt.merchant.replace(/[^a-z0-9]/gi, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    const newUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.moveAsync({
      from: uri,
      to: newUri,
    });
    
    return newUri;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    return null;
  }
};

// Share receipt (PDF or image)
export const shareReceipt = async (receipt: Receipt, options?: { format?: 'pdf' | 'image' }) => {
  try {
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    let fileUri: string | null = null;
    const format = options?.format || 'pdf';
    
    if (format === 'pdf') {
      // Generate and share PDF
      fileUri = await exportReceiptAsPDF(receipt);
      if (!fileUri) {
        throw new Error('Failed to generate PDF');
      }
    } else {
      // Share the receipt image directly
      fileUri = receipt.imageUri;
      if (!fileUri) {
        throw new Error('No receipt image available');
      }
    }
    
    // Share the file
    await Sharing.shareAsync(fileUri, {
      mimeType: format === 'pdf' ? 'application/pdf' : 'image/*',
      dialogTitle: `Share Receipt - ${receipt.merchant}`,
      UTI: format === 'pdf' ? 'com.adobe.pdf' : 'public.image',
    });
    
    return true;
  } catch (error) {
    console.error('Error sharing receipt:', error);
    throw error;
  }
};

// Export receipt data as JSON
export const exportReceiptAsJSON = (receipt: Receipt): string => {
  const exportData = {
    ...receipt,
    exportedAt: new Date().toISOString(),
    appName: 'Infinite',
    version: '1.0.0',
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Share receipt as text
export const shareReceiptAsText = async (receipt: Receipt) => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      throw new Error('Sharing is not available on this device');
    }
    
    const formatDate = (dateString: string) => {
      try {
        const date = parseISO(dateString);
        return format(date, 'PPP');
      } catch {
        return dateString;
      }
    };
    
    const text = `Receipt from ${receipt.merchant}
━━━━━━━━━━━━━━━━━━━━━━━━
Amount: ${formatCurrency(receipt.amount)}
Date: ${formatDate(receipt.date)}
Category: ${receipt.category || 'N/A'}
Payment: ${receipt.paymentMethod || 'N/A'}
${receipt.tags && receipt.tags.length > 0 ? `Tags: ${receipt.tags.join(', ')}` : ''}
${receipt.notes ? `\nNotes: ${receipt.notes}` : ''}

Receipt ID: ${receipt.id}
━━━━━━━━━━━━━━━━━━━━━━━━
Shared from Infinite App`;
    
    // Create temporary text file
    const fileName = `receipt_${receipt.merchant.replace(/[^a-z0-9]/gi, '_')}.txt`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    await FileSystem.writeAsStringAsync(fileUri, text, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/plain',
      dialogTitle: `Share Receipt - ${receipt.merchant}`,
    });
    
    // Clean up temporary file
    await FileSystem.deleteAsync(fileUri, { idempotent: true });
    
    return true;
  } catch (error) {
    console.error('Error sharing receipt as text:', error);
    throw error;
  }
};