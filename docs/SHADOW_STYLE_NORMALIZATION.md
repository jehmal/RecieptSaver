# Shadow Style Normalization Guide

## Overview

React Native Web deprecated the iOS-style shadow properties (`shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`) in favor of the CSS `boxShadow` property. This causes deprecation warnings when running React Native apps on web platforms.

## Solution

We've implemented a `styleNormalizer` utility that automatically converts shadow properties to `boxShadow` format on web platforms while preserving native shadow behavior on iOS and Android.

## Key Features

1. **Automatic Platform Detection**: Converts shadows only on web, preserves native properties on iOS/Android
2. **Elevation Support**: Converts Android's `elevation` prop to appropriate `boxShadow` on web
3. **Color Parsing**: Handles hex colors, named colors, and rgb/rgba formats
4. **Material Design Compliance**: Elevation values follow Material Design shadow specifications

## Usage

### Method 1: Using `normalizeStyle()` with StyleSheet

```tsx
import { normalizeStyle } from '../../utils';

// Wrap your styles with normalizeStyle
<View style={normalizeStyle(styles.card)}>
  {/* content */}
</View>

// For multiple styles
<View style={normalizeStyle([
  styles.card,
  isSelected && styles.cardSelected,
  { opacity: animatedValue }
])}>
  {/* content */}
</View>

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    // These will be converted to boxShadow on web
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  }
});
```

### Method 2: Using Shadow Helper Functions

```tsx
import { createShadowStyle, createElevationStyle } from '../../utils';

// Create cross-platform shadow styles
const cardShadow = createShadowStyle(
  '#000',                    // shadowColor
  { width: 0, height: 2 },   // shadowOffset
  0.25,                      // shadowOpacity
  4,                         // shadowRadius
  3                          // elevation (for Android)
);

// Or use elevation-based shadows
const elevatedCard = createElevationStyle(8); // Material Design elevation

// Apply to components
<View style={[styles.baseCard, cardShadow]}>
  {/* content */}
</View>
```

### Method 3: Theme Integration

```tsx
// In your theme file
import { createShadowStyle } from '../utils/styleNormalizer';

export const theme = {
  shadows: {
    sm: createShadowStyle('#000', { width: 0, height: 2 }, 0.25, 4, 2),
    md: createShadowStyle('#000', { width: 0, height: 4 }, 0.3, 8, 4),
    lg: createShadowStyle('#000', { width: 0, height: 8 }, 0.35, 16, 8),
  }
};

// Usage in components
<View style={[styles.card, theme.shadows.md]}>
  {/* content */}
</View>
```

### Method 4: Inline Styles

```tsx
// Inline styles are also normalized
<View style={normalizeStyle({
  backgroundColor: 'white',
  shadowColor: '#2563EB',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.4,
  shadowRadius: 10,
  elevation: 12,
})}>
  {/* content */}
</View>
```

## Platform Behavior

### Web
- Converts `shadow*` props to CSS `boxShadow`
- Removes deprecated shadow properties
- Format: `${offsetX}px ${offsetY}px ${blurRadius}px ${spread}px ${color}`

### iOS
- Preserves native shadow properties
- Uses `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`

### Android
- Uses `elevation` for Material Design shadows
- On web, elevation is converted to appropriate `boxShadow`

## Best Practices

1. **Always normalize shadow styles** when using them in components
2. **Use theme shadows** for consistency across your app
3. **Prefer elevation values** that match Material Design (1-24)
4. **Test on all platforms** to ensure shadows look appropriate

## Migration Guide

To migrate existing components:

1. Import the normalizer: `import { normalizeStyle } from '../../utils';`
2. Wrap style props that contain shadows: `style={normalizeStyle(styles.card)}`
3. Or update your theme to use shadow helpers
4. Test on web to ensure warnings are resolved

## Troubleshooting

### Still seeing warnings?
- Ensure you're wrapping ALL components that use shadow styles
- Check animated styles - use `createNormalizedAnimatedStyle` for those
- Verify imports are correct

### Shadows not appearing on web?
- Check that shadow opacity is not 0
- Ensure shadow radius is greater than 0
- Verify the shadowColor is valid

### Different shadow appearance across platforms?
- This is expected - each platform renders shadows differently
- Use the elevation-based helpers for more consistent cross-platform shadows