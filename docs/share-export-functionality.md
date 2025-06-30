# Share & Export Functionality

## Overview
The Infinite app now includes comprehensive share and export functionality for receipts, allowing users to export and share their receipts in multiple formats.

## Features

### 1. Share Functionality
Users can share receipts in three formats:
- **PDF**: Generates a professionally formatted PDF with all receipt details
- **Image**: Shares the original receipt image
- **Text**: Creates a text file with formatted receipt information

### 2. Export Functionality  
- **Export as PDF**: Saves a PDF file locally with all receipt details and styling
- **Export as Image**: Shares the receipt image through the native share dialog

## Implementation Details

### Core Files

1. **`src/utils/receiptExport.ts`**
   - Contains all export and sharing utility functions
   - `exportReceiptAsPDF()`: Generates PDF from receipt data
   - `shareReceipt()`: Handles sharing in different formats
   - `shareReceiptAsText()`: Creates and shares text format
   - `exportReceiptAsJSON()`: Exports receipt data as JSON

2. **`src/screens/ReceiptDetailScreen.tsx`**
   - Updated to integrate share/export functionality
   - Includes menu options for PDF and image export
   - Share button shows format selection dialog

3. **`src/components/modals/ReceiptDetailModal.tsx`**
   - Alternative receipt detail view with share functionality
   - Supports the same share formats as the main screen

4. **`src/components/receipt/ActionButtons.tsx`**
   - Enhanced with loading states for better UX
   - Handles async operations properly

## Usage

### In Receipt Detail Screen
1. Open any receipt detail view
2. Tap the "Share" button to see sharing options
3. Tap the "Export Receipt" button to see export options
4. Select desired format from the dialog

### Available Formats

#### PDF Export
- Professional layout with receipt image
- All receipt details including tags and notes
- Formatted date and time
- Company branding

#### Image Share
- Shares the original receipt image
- Uses native share dialog
- Supports all apps that accept images

#### Text Share
- Formatted text with all receipt details
- Easy to copy/paste
- Includes all metadata

## Technical Requirements

### Dependencies
- `expo-sharing`: For native sharing functionality
- `expo-print`: For PDF generation
- `expo-file-system`: For file operations

### Permissions
- iOS: No additional permissions required
- Android: Storage permissions for saving files

## Error Handling
- Graceful error messages for failed operations
- Fallback options when sharing is unavailable
- Loading states to prevent duplicate operations

## Future Enhancements
- CSV export for bulk data
- Email integration
- Cloud storage integration
- Batch export functionality