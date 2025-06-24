# Receipt Vault Pro - Home Screen UI Specification

This document provides a detailed specification for implementing the home screen design based on Blackbird iOS 28 UI, adapted for Receipt Vault Pro.

## Overall Design System

### Color Palette
- **Background**: `#F5F5F7` (Light gray, almost white)
- **Card Background**: `#FFFFFF` (Pure white)
- **Primary Text**: `#1C1C1E` (Near black)
- **Secondary Text**: `#8E8E93` (Gray)
- **Accent Color**: `#007AFF` (iOS Blue)
- **Progress/Pills Background**: `#E5E5EA` (Light gray pill)
- **Tab Bar Background**: `#FFF5F5` (Very light pink/blush)
- **Selected Tab Icon**: `#000000` (Black)
- **Unselected Tab Icon**: `#8E8E93` (Gray)

### Typography
- **Large Number (Total)**: SF Pro Display, 64px, Bold, #1C1C1E
- **Card Title**: SF Pro Display, 20px, Semibold, #1C1C1E
- **Card Subtitle**: SF Pro Text, 17px, Regular, #1C1C1E
- **Progress Labels**: SF Pro Text, 17px, Regular, #8E8E93
- **Pill Label**: SF Pro Text, 17px, Medium, #1C1C1E
- **Tab Labels**: SF Pro Text, 12px, Regular

### Spacing & Layout
- **Screen Padding**: 20px horizontal
- **Card Corner Radius**: 20px
- **Card Padding**: 24px
- **Vertical Spacing Between Cards**: 16px
- **Status Bar Height**: Standard iOS (44px)
- **Tab Bar Height**: 83px (including safe area)

## Component Breakdown

### 1. Status Bar
- **Time**: "9:41" with location icon
- **Right Icons**: Signal bars, WiFi, Battery
- **Style**: Dark content on light background

### 2. Header Section
- **Layout**: Horizontal flex, space-between
- **Left**: User's circular profile image (56x56px)
- **Right**: Settings icon button (44x44px, light gray background circle)

### 3. Monthly Total Display Section
- **Centered Large Number**: "$2,348.67" (current month's total)
- **Pill Button Below**: Gray pill with receipt icon + "OCT 2024" text
- **Styling**: 
  - Number: 64px, Bold
  - Pill: Height 40px, horizontal padding 20px
  - Background: #E5E5EA
  - Icon size: 20x20px

### 4. Progress Card - "Monthly Spending Goals"
- **Title**: "Monthly Spending Goals"
- **Chevron**: Right-pointing arrow
- **Two Progress Circles**:
  - Left: "87 / 120 Receipts" - 72% complete arc
  - Right: "$2,348 / $3,000 Budget" - 78% complete arc
- **Circle Styling**:
  - Size: 80x80px
  - Stroke width: 8px
  - Active color: #1C1C1E
  - Inactive color: #E5E5EA
  - Text below each circle

### 5. Featured Receipt Card - "Top Merchant This Month"
- **Title**: "Whole Foods Market"
- **Subtitle**: "12 receipts this month • $487.32 total spent"
- **Right Image**: Merchant logo circular (80x80px)
- **Pagination Dots**: 4 dots for multiple featured insights
  - Active: #1C1C1E
  - Inactive: #D1D1D6
  - Size: 8x8px
  - Spacing: 8px

### 6. Tab Selector Pills
- **Two Pills**: "Personal" (selected) and "Business"
- **Selected Style**: 
  - Background: #1C1C1E
  - Text: #FFFFFF
  - Height: 52px
  - Full pill shape
- **Unselected Style**:
  - Background: transparent
  - Text: #1C1C1E
  - Same height

### 7. Recent Receipt Card (Bottom)
- **Receipt Preview**: Full width minus padding
- **Image**: Receipt photo with overlay gradient
- **Overlay Content**: 
  - "Target" (merchant name in white)
  - "$127.45" (amount tag in white)
- **Card Height**: ~200px

### 8. Tab Bar
- **Background**: #FFF5F5 (Light pink/blush)
- **Height**: 83px including safe area
- **3 Tab Items**:
  - Home (house icon) - Selected
  - Center Action (camera icon in circle) - Prominent for quick capture
  - Search (magnifying glass icon)
- **Center Button**: 
  - Size: 56x56px
  - Black background
  - White camera icon
  - Elevated/raised appearance

## Content Specifications for Receipt Context

### Monthly Total Display
- Shows current month's total spending
- Updates in real-time as receipts are added
- Tapping the pill shows monthly breakdown

### Progress Circles Content
1. **Receipts Circle**: "X / Y Receipts"
   - X = Current month receipt count
   - Y = Average monthly receipts or goal
   
2. **Budget Circle**: "$X / $Y Budget"
   - X = Current spending
   - Y = Monthly budget limit

### Featured Insights Carousel (4 cards):
1. **Top Merchant** - Most visited merchant with stats
2. **Biggest Purchase** - Largest single receipt this month
3. **Category Leader** - Top spending category
4. **Savings Alert** - Comparison to last month

### Tab Filtering
- **Personal**: Shows personal receipts only
- **Business**: Shows business/reimbursable receipts only

### Recent Receipts Section
- Shows last 5-6 receipts as preview cards
- Each shows: Merchant name, amount, date
- Tap to view full receipt details

### Animation Specifications:
- Card appearances: Fade in with slight scale (0.95 to 1.0)
- Tab transitions: Smooth opacity change
- Progress circles: Animated stroke drawing
- Number changes: Count up animation

### Responsive Considerations:
- Maintain proportions on different screen sizes
- Adjust font sizes for smaller devices
- Keep minimum touch targets at 44x44px

## File Structure:
```
src/
  screens/
    HomeScreen.tsx (new - main implementation)
  components/
    home/
      PointsDisplay.tsx
      ProgressCard.tsx
      ReceiptCarousel.tsx
      TabSelector.tsx
      QuickStats.tsx
```

This specification provides all the details needed to recreate the Blackbird UI design 1:1 for the Receipt Vault Pro home screen.