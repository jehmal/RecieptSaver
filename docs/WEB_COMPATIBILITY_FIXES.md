# React Native Web Compatibility Fixes

## Overview

This document describes the runtime patches implemented to fix toFixed errors in React Native Web's color normalization and style processing, as well as other web compatibility fixes.

## toFixed Error Fixes

### The Problem

React Native Web's internal color processing sometimes calls `toFixed()` on invalid Number objects, causing errors like:
```
TypeError: Number(...).toFixed is not a function
```

This typically happens when:
- Color values are wrapped in `Number` objects (e.g., `new Number(0.5)`)
- Invalid numeric values (NaN, Infinity, null) are passed to style properties
- Complex color transformations result in unexpected data types

### Solution Architecture

#### 1. **Safe toFixed Utility** (`src/utils/safeToFixed.ts`)
A robust wrapper that handles:
- Number objects (`new Number(value)`)
- Invalid values (NaN, Infinity, null, undefined)
- String numbers ("123.45", "$123.45")
- Edge cases and type coercion

#### 2. **Web Style Patches** (`src/utils/webStylePatches.ts`)
Runtime patches that:
- Monkey-patch `Number.prototype.toFixed` to use safeToFixed
- Track problematic calls in development
- Provide detailed debugging information
- Can be toggled on/off for testing

#### 3. **Development Helpers** (`src/utils/developmentHelpers.ts`)
Tools for debugging:
- `toFixedErrorAnalyzer`: Tracks and analyzes toFixed errors
- `testWebStylePatches()`: Verifies patches are working
- `monitorToFixedCalls()`: Real-time monitoring of toFixed usage

### Implementation Details

#### Initialization
Patches are applied early in `App.tsx`:
```typescript
import { initializeWebStylePatches } from './src/utils/webStylePatches';

// Initialize web-specific patches
initializeWebStylePatches();
```

#### How the Patch Works

1. **Intercepts toFixed calls**: All calls to `Number.prototype.toFixed` are routed through our safe wrapper
2. **Handles edge cases**: Number objects, invalid values, and non-numeric inputs are gracefully handled
3. **Preserves behavior**: Valid toFixed calls work exactly as before
4. **Development warnings**: Problematic calls are logged with stack traces and suggestions

#### Example Usage

```typescript
// These would normally throw errors in React Native Web:
new Number(0.5).toFixed(2);  // Now returns "0.50"
(NaN).toFixed(2);            // Now returns "0.00"
(null as any).toFixed(2);    // Now returns "0.00"

// Using safeToFixed directly:
import { safeToFixed } from './utils/safeToFixed';

safeToFixed(123.456, 2);     // "123.46"
safeToFixed("$123.45", 2);   // "123.45"
safeToFixed(null, 2);        // "0.00"
```

### Testing

#### Manual Testing
1. Run the app in web mode: `npm run web`
2. Open browser console
3. Check for successful patch message: `[WebStylePatches] React Native Web style patches applied successfully`
4. Navigate through the app - no toFixed errors should appear

#### Automated Testing
Use the SafeToFixedExample component:
```typescript
import { SafeToFixedExample } from './src/components/examples/SafeToFixedExample';

// Add to a screen or test route
<SafeToFixedExample />
```

#### Console Commands
Test patches directly in the browser console:
```javascript
// Test problematic values
new Number(0.5).toFixed(2);  // Should work

// Check if patches are applied
Number.prototype.toFixed.__patched;  // Should be true

// Run comprehensive tests
testWebStylePatches();

// Monitor toFixed calls for 5 seconds
monitorToFixedCalls(5000);
```

### Performance Considerations

- Patches are only applied on web platform
- In production, minimal overhead (simple value checking)
- In development, additional logging and tracking
- No impact on iOS/Android builds

### Troubleshooting

#### Patches Not Working
1. Ensure patches are initialized before React Native Web
2. Check console for patch confirmation message
3. Verify Platform.OS === 'web'

#### Still Getting Errors
1. Check if error is from a different source
2. Look for third-party libraries calling toFixed
3. Use `toFixedErrorAnalyzer.getSummary()` to analyze patterns

#### Development Tips
- Use `safeToFixed()` directly in your code when possible
- Monitor console warnings for problematic patterns
- Test with edge cases (null amounts, invalid colors)

## Gallery Screen Web Compatibility

### Summary of Changes

This section summarizes the fixes applied to make the Gallery screen work properly on web platforms.

### 1. Expo Haptics Compatibility

**Problem**: `expo-haptics` doesn't work on web and causes the app to crash.

**Solution**: Conditional imports and usage checks:

```typescript
// Platform-specific imports
let Haptics: any = null;
if (Platform.OS !== 'web') {
  Haptics = require('expo-haptics');
}

// Usage with null check
if (Platform.OS !== 'web' && Haptics) {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}
```

**Files Modified**:
- `/src/screens/GalleryScreen.tsx`
- `/src/components/gallery/ReceiptCard.tsx`
- `/src/components/gestures/PinchGridView.tsx`

### 2. React Native Gesture Handler Compatibility

**Problem**: `GestureHandlerRootView` and gesture handlers may not work properly on web.

**Solution**: 
1. Conditional wrapping of `GestureHandlerRootView`
2. Platform-specific rendering for gesture components

```typescript
// In GalleryScreen.tsx
const content = (
  <View style={styles.container}>
    {/* ... main content ... */}
  </View>
);

// Wrap with GestureHandlerRootView only on native platforms
if (Platform.OS === 'web') {
  return content;
}

return (
  <GestureHandlerRootView style={{ flex: 1 }}>
    {content}
  </GestureHandlerRootView>
);
```

```typescript
// In PinchGridView.tsx
{Platform.OS === 'web' ? (
  // On web, just render the grid without gesture handling
  <View style={styles.gridContainer}>
    {children(columns)}
  </View>
) : (
  <PinchGestureHandler
    onHandlerStateChange={onPinchHandlerStateChange}
    enabled={enabled}
  >
    {/* ... gesture handling ... */}
  </PinchGestureHandler>
)}
```

### 3. Import Organization

**Problem**: `PinchGridView` wasn't exported from the gestures index file.

**Solution**: Added export to `/src/components/gestures/index.ts`:
```typescript
export { PinchGridView } from './PinchGridView';
```

## Testing Recommendations

1. **Web Platform**: Test that the Gallery screen loads without errors and displays receipts correctly
2. **Native Platforms**: Ensure haptic feedback and gesture handling still work as expected
3. **Feature Degradation**: Verify that web users can still interact with receipts (tap to view details) even without advanced gestures

## Known Limitations on Web

- No haptic feedback (expected)
- No pinch-to-zoom grid resizing (falls back to default column count)
- Gesture hints may show features that don't work on web (consider adding platform-specific hints)

## Future Improvements

1. Consider implementing web-specific gesture alternatives (e.g., mouse wheel for zoom)
2. Add platform-specific gesture hints
3. Implement keyboard shortcuts for web users as alternatives to gestures

## Related Files

### toFixed Error Fixes
- `/src/utils/safeToFixed.ts` - Core safe wrapper implementation
- `/src/utils/webStylePatches.ts` - Runtime patches
- `/src/utils/developmentHelpers.ts` - Debugging tools
- `/src/components/examples/SafeToFixedExample.tsx` - Interactive demo
- `/App.tsx` - Patch initialization

### Gallery Screen Fixes
- `/src/screens/GalleryScreen.tsx`
- `/src/components/gallery/ReceiptCard.tsx`
- `/src/components/gestures/PinchGridView.tsx`
- `/src/components/gestures/index.ts`

## References

- [React Native Web Issues](https://github.com/necolas/react-native-web/issues)
- [MDN: Number.prototype.toFixed()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)
- [React Native Web Style Processing](https://github.com/necolas/react-native-web/tree/master/packages/react-native-web/src/exports/StyleSheet)
- [Expo Haptics Documentation](https://docs.expo.dev/versions/latest/sdk/haptics/)
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/)