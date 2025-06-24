# Receipt Detail Screen UI Specification
Based on Blackbird iOS 54 Design System

## Overview
Modal presentation displaying comprehensive receipt information with image preview, transaction details, and action controls.

## Modal Container
- **Presentation Style**: Bottom sheet modal with drag-to-dismiss
- **Background**: Semi-transparent overlay (rgba(0,0,0,0.4))
- **Card Properties**:
  - Corner radius: 20px (top-left, top-right)
  - Background color: #FFFFFF
  - Shadow: 0px -2px 10px rgba(0,0,0,0.1)
  - Max height: 90% of screen height
  - Width: Full screen width
  - Bottom safe area padding: 34px (iPhone X+) or 20px

## Header Section
**Height**: 56px
**Padding**: 16px horizontal

### Close Button (Left)
- **Icon**: SF Symbol "xmark"
- **Size**: 24x24px
- **Color**: #8E8E93
- **Tap target**: 44x44px
- **Position**: 16px from left edge, vertically centered

### Menu Button (Right)
- **Icon**: SF Symbol "ellipsis"
- **Size**: 24x24px
- **Color**: #8E8E93
- **Tap target**: 44x44px
- **Position**: 16px from right edge, vertically centered
- **Menu Options**:
  - Export PDF
  - Export Image
  - Delete Receipt
  - Report Issue

## Receipt Image Section
**Container Height**: 280px
**Background**: #F5F5F7
**Corner Radius**: 12px
**Margin**: 16px horizontal, 8px top

### Image Display
- **Aspect Ratio**: Maintain original
- **Scaling**: Aspect fit
- **Max dimensions**: 248px width, 260px height
- **Position**: Centered in container
- **Loading State**: Skeleton shimmer effect
- **Error State**: Document icon with "Image unavailable" text

### Image Controls
- **Zoom**: Pinch-to-zoom enabled
- **Double tap**: Toggle between fit/fill
- **Swipe**: If multiple images, horizontal pagination

## Merchant Information Section
**Margin Top**: 20px
**Padding**: 0 20px

### Merchant Name
- **Font**: SF Pro Display Semibold
- **Size**: 28px
- **Color**: #1C1C1E
- **Line Height**: 34px
- **Max Lines**: 2
- **Truncation**: Tail truncation with ellipsis

### Category Badge
- **Font**: SF Pro Text Medium
- **Size**: 15px
- **Color**: #48484A
- **Background**: #F2F2F7
- **Padding**: 6px 12px
- **Corner Radius**: 6px
- **Margin Top**: 8px

## Receipt Details Grid
**Margin Top**: 24px
**Padding**: 0 20px
**Grid Layout**: 2 columns
**Row Height**: 56px
**Column Gap**: 16px
**Row Gap**: 16px

### Grid Items
Each item contains:
- **Label** (top):
  - Font: SF Pro Text Regular
  - Size: 13px
  - Color: #8E8E93
  - Text transform: Uppercase
  - Letter spacing: 0.5px
- **Value** (bottom):
  - Font: SF Pro Text Semibold
  - Size: 17px
  - Color: #1C1C1E
  - Margin top: 4px

### Grid Content
1. **Amount**
   - Label: "AMOUNT"
   - Value: "$XX.XX"
   - Position: Top left

2. **Date**
   - Label: "DATE"
   - Value: "MMM DD, YYYY"
   - Position: Top right

3. **Payment Method**
   - Label: "PAYMENT"
   - Value: "•••• 1234" or "Cash"
   - Position: Bottom left

4. **Time**
   - Label: "TIME"
   - Value: "HH:MM AM/PM"
   - Position: Bottom right

## Tags Section
**Margin Top**: 24px
**Padding**: 0 20px

### Section Header
- **Text**: "Tags"
- **Font**: SF Pro Text Medium
- **Size**: 13px
- **Color**: #8E8E93
- **Text transform**: Uppercase
- **Letter spacing**: 0.5px

### Tag Container
- **Margin Top**: 8px
- **Layout**: Horizontal scroll view
- **Item Spacing**: 8px

### Tag Pills
- **Height**: 32px
- **Padding**: 8px 16px
- **Background**: #007AFF (selected) or #F2F2F7 (unselected)
- **Corner Radius**: 16px
- **Font**: SF Pro Text Medium
- **Size**: 15px
- **Color**: #FFFFFF (selected) or #1C1C1E (unselected)

### Add Tag Button
- **Icon**: SF Symbol "plus.circle.fill"
- **Size**: 32x32px
- **Color**: #8E8E93
- **Position**: End of tag list

## Action Buttons Section
**Position**: Fixed bottom
**Padding**: 20px horizontal, 16px vertical
**Background**: White with top border (1px #E5E5E7)

### Primary Button (Export)
- **Height**: 50px
- **Background**: #1C1C1E
- **Corner Radius**: 25px
- **Font**: SF Pro Text Semibold
- **Size**: 17px
- **Color**: #FFFFFF
- **Text**: "Export Receipt"
- **Icon**: SF Symbol "square.and.arrow.up" (left side)
- **Icon Size**: 20x20px
- **Icon Margin**: 8px

### Secondary Button (Share)
- **Height**: 50px
- **Background**: #F2F2F7
- **Corner Radius**: 25px
- **Font**: SF Pro Text Semibold
- **Size**: 17px
- **Color**: #1C1C1E
- **Text**: "Share"
- **Icon**: SF Symbol "square.and.arrow.up" (left side)
- **Margin Top**: 12px

## Color Palette
```
Primary:
- Text Primary: #1C1C1E
- Text Secondary: #8E8E93
- Background: #FFFFFF
- Surface: #F5F5F7
- Surface Secondary: #F2F2F7
- Divider: #E5E5E7
- Primary Action: #007AFF
- Dark Action: #1C1C1E

Status Colors:
- Success: #34C759
- Warning: #FF9500
- Error: #FF3B30
```

## Typography Scale
```
Display:
- Large Title: SF Pro Display Semibold 28px

Body:
- Body Large: SF Pro Text Semibold 17px
- Body Regular: SF Pro Text Regular 17px
- Body Medium: SF Pro Text Medium 15px
- Caption: SF Pro Text Regular 13px
- Label: SF Pro Text Medium 13px (uppercase)
```

## Interaction States

### Buttons
- **Default**: As specified
- **Pressed**: 0.95 scale, 0.2s ease-out
- **Disabled**: 0.4 opacity

### Interactive Elements
- **Tap Highlight**: System default with 8px padding
- **Long Press**: Haptic feedback (impact light)

## Animation Specifications

### Modal Presentation
- **Duration**: 0.3s
- **Easing**: Spring damping 0.8
- **Enter**: Slide up from bottom
- **Exit**: Slide down to dismiss

### Image Loading
- **Skeleton**: Pulse animation 1.5s infinite
- **Fade In**: 0.3s ease-out on load

### Tag Selection
- **Duration**: 0.2s
- **Easing**: ease-in-out
- **Scale**: 0.95 on press

## Accessibility

### VoiceOver Labels
- Close button: "Close receipt details"
- Menu button: "More options"
- Receipt image: "Receipt image, double tap to zoom"
- Export button: "Export receipt as PDF"
- Share button: "Share receipt"

### Dynamic Type Support
- Minimum scale: 85%
- Maximum scale: 135%
- Line height adjustments automatic

### Color Contrast
- All text meets WCAG AA standards
- Minimum contrast ratio: 4.5:1

## Edge Cases

### No Image Available
- Display placeholder icon
- Text: "Receipt image unavailable"
- Maintain container height

### Long Merchant Names
- Two-line maximum
- Tail truncation
- Full name in VoiceOver

### Multiple Images
- Page indicators below image
- Swipe gesture between images
- Current/Total indicator: "1 of 3"

## Platform Variations

### iPad
- Modal width: 540px max
- Centered presentation
- Increased padding: 24px

### Landscape Orientation
- Two-column layout for details
- Side-by-side image and info
- Adjusted button positioning