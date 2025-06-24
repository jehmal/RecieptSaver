# Theme Inconsistencies Report

## Summary
This report identifies all components and screens in the codebase that have theme inconsistencies and need fixes.

## Files with Theme Issues

### 1. Components NOT Using useTheme Hook (20 files)
These components don't import or use the `useTheme` hook and are using hardcoded colors:

#### Screens:
- **CameraScreen.tsx**
  - Hardcoded colors: `#000`, `white`, `#2563EB`, `#10B981`, `#1E293B`, `#64748B`, `#E2E8F0`
  - StatusBar: Uses `barStyle="light-content"` without theme support
  
- **GalleryScreen.tsx**
  - Hardcoded colors: `#F8FAFC`, `#1E293B`, `#64748B`, `white`, `#2563EB`, `#E2E8F0`, `#94A3B8`, `#EFF6FF`, `#DBEAFE`, `#EF4444`
  - StatusBar: Uses `barStyle="dark-content"` and `backgroundColor="#F8FAFC"`
  
- **ReceiptDetailScreen.tsx**
  - Hardcoded colors: `white`, `#F8FAFC`, `#1E293B`, `#64748B`, and more
  - StatusBar: Uses hardcoded values
  - Modal component without theme support

#### Home Components:
- **FeaturedInsightsCarousel.tsx** - Uses hardcoded colors
- **TabSelector.tsx** - Uses hardcoded colors
- **RecentReceiptCard.tsx** - Uses hardcoded colors
- **FeaturedMerchantCard.tsx** - Uses theme import but doesn't use useTheme hook
- **MerchantCard.tsx** - Needs verification
- **MonthlyTotalDisplay.tsx** - Needs verification
- **CircularProgressRing.tsx** - Needs verification
- **ProgressCard.tsx** - Needs verification
- **BlackbirdTabSelector.tsx** - Needs verification

#### Receipt Components:
- **ReceiptImageViewer.tsx** - Uses hardcoded colors
- **ReceiptInfoGrid.tsx** - Uses hardcoded colors
- **ReceiptTags.tsx** - Uses hardcoded colors
- **ActionButtons.tsx** - Uses hardcoded colors
- **ReceiptDetailExample.tsx** - Uses hardcoded colors

#### Gallery Components:
- **ReceiptCard.tsx** - Uses hardcoded colors

#### Search Components:
- **FilterPills.tsx** - Uses hardcoded colors
- **TagPill.tsx** - Uses hardcoded colors

#### Navigation:
- **AppNavigator.tsx** - Has Modal components that need theme support

### 2. Hardcoded Color Patterns Found

#### Most Common Hardcoded Colors:
- `white` - Found in multiple files
- `black` / `#000` - Found in CameraScreen.tsx and others
- `#1E293B` - Dark gray, used for text
- `#64748B` - Medium gray, used for secondary text
- `#E2E8F0` - Light gray, used for borders
- `#2563EB` - Blue, used for primary actions
- `#F8FAFC` - Very light gray, used for backgrounds
- `#10B981` - Green, used for success states
- `#EF4444` - Red, used for destructive actions

### 3. StatusBar Issues
The following screens have StatusBar components without theme handling:
- CameraScreen.tsx - `barStyle="light-content"`
- GalleryScreen.tsx - `barStyle="dark-content"` with hardcoded background
- ReceiptDetailScreen.tsx - Needs theme-aware StatusBar
- SearchScreen.tsx - Needs verification

### 4. Modal Components
The following files have Modal components that need theme support:
- AppNavigator.tsx
- ReceiptDetailScreen.tsx
- ReceiptDetailExample.tsx

### 5. Text Components Without Theme Colors
Most Text components across all files use hardcoded color styles instead of theme colors.

## Recommended Actions

1. **Add useTheme hook** to all components listed above
2. **Replace hardcoded colors** with theme values:
   - `white` → `theme.colors.background`
   - `#1E293B` → `theme.colors.text`
   - `#64748B` → `theme.colors.secondaryText`
   - `#E2E8F0` → `theme.colors.border`
   - `#2563EB` → `theme.colors.primary`
   - `#F8FAFC` → `theme.colors.surface`
   - etc.

3. **Update StatusBar** components to use theme:
   ```tsx
   const { theme } = useTheme();
   <StatusBar 
     barStyle={theme.dark ? "light-content" : "dark-content"}
     backgroundColor={theme.colors.background}
   />
   ```

4. **Add theme support to Modal** components:
   ```tsx
   <Modal>
     <View style={{ backgroundColor: theme.colors.background }}>
       {/* Modal content */}
     </View>
   </Modal>
   ```

5. **Update all Text components** to use theme colors by default

## Priority Order
1. **High Priority**: Screens (CameraScreen, GalleryScreen, ReceiptDetailScreen)
2. **Medium Priority**: Navigation components and Modals
3. **Low Priority**: Individual UI components

## Total Files Requiring Updates: ~23 files