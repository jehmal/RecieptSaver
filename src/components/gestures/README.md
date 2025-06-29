# Gesture Components for Receipt Vault Pro

This directory contains reusable gesture-based interaction components for React Native applications using react-native-gesture-handler.

## Components

### 1. SwipeableReceiptCard
Provides swipeable functionality for receipt list items with customizable actions.

**Features:**
- Swipe right for quick categorization
- Swipe left for archive/delete
- Long press to enter selection mode
- Double tap for quick view
- Haptic feedback on all interactions

**Usage:**
```tsx
<SwipeableReceiptCard
  leftActions={[
    {
      type: 'categorize',
      color: '#007AFF',
      icon: 'pricetag',
      label: 'Category',
      onPress: handleCategorize,
    }
  ]}
  rightActions={[
    {
      type: 'archive',
      color: '#FF9500',
      icon: 'archive',
      label: 'Archive',
      onPress: handleArchive,
    }
  ]}
  onLongPress={handleLongPress}
  onDoubleTap={handleDoubleTap}
>
  <YourReceiptComponent />
</SwipeableReceiptCard>
```

### 2. PinchZoomView
Enables pinch-to-zoom and pan functionality for images and content.

**Features:**
- Pinch to zoom with min/max limits
- Double tap to zoom
- Pan when zoomed
- Smooth animations

**Usage:**
```tsx
<PinchZoomView
  minZoom={1}
  maxZoom={4}
  doubleTapZoom={2}
  onZoomStart={() => console.log('Zoom started')}
  onZoomEnd={(scale) => console.log('Zoom ended at', scale)}
>
  <Image source={{ uri: imageUrl }} />
</PinchZoomView>
```

### 3. PullToRefresh
Custom pull-to-refresh implementation with animated feedback.

**Features:**
- Smooth pull animations
- Custom refresh indicators
- Haptic feedback at threshold
- Platform-specific behavior

**Usage:**
```tsx
<PullToRefresh
  onRefresh={async () => {
    await fetchData();
  }}
  tintColor="#007AFF"
  title="Pull to refresh"
>
  <YourScrollableContent />
</PullToRefresh>
```

### 4. MultiSelectGesture
Enables multi-select functionality with two-finger swipe gestures.

**Features:**
- Long press to start selection
- Two-finger swipe to select range
- Visual selection indicators
- Selection callbacks

**Usage:**
```tsx
<MultiSelectGesture
  itemHeight={80}
  totalItems={items.length}
  onSelectionStart={() => console.log('Selection started')}
  onSelectionChange={(indices) => console.log('Selected:', indices)}
  onSelectionEnd={(indices) => console.log('Final selection:', indices)}
>
  <FlatList data={items} />
</MultiSelectGesture>
```

### 5. DismissibleModal
Modal with swipe-to-dismiss functionality.

**Features:**
- Swipe down to dismiss
- Velocity-based dismissal
- Backdrop animations
- Customizable thresholds

**Usage:**
```tsx
<DismissibleModal
  visible={showModal}
  onDismiss={() => setShowModal(false)}
  dismissThreshold={150}
  presentationStyle="pageSheet"
>
  <YourModalContent />
</DismissibleModal>
```

### 6. PinchGridView
Allows changing grid columns with pinch gestures.

**Features:**
- Pinch to change grid size
- Visual feedback during pinch
- Column count indicators
- Smooth transitions

**Usage:**
```tsx
<PinchGridView
  minColumns={2}
  maxColumns={4}
  defaultColumns={3}
  onColumnsChange={(columns) => console.log('Columns:', columns)}
>
  {(columns) => (
    <FlatList
      data={items}
      numColumns={columns}
      key={columns} // Force re-render
    />
  )}
</PinchGridView>
```

### 7. GestureHints
Shows gesture hints on first use of each screen.

**Features:**
- Screen-specific hints
- Auto-dismiss after first view
- Animated presentation
- AsyncStorage persistence

**Usage:**
```tsx
<GestureHints 
  screen="search" // or "gallery", "detail", "camera"
  onDismiss={() => console.log('Hints dismissed')}
/>
```

## Platform Considerations

### iOS
- Haptic feedback uses iOS-specific impact types
- Swipe gestures follow iOS conventions
- Modal presentations use iOS-style animations

### Android
- Haptic feedback uses notification feedback
- Material Design-inspired animations
- Android-specific gesture velocities

## Best Practices

1. **Performance**: All gesture handlers use native driver for optimal performance
2. **Accessibility**: Gestures should complement, not replace, standard touch interactions
3. **Visual Feedback**: Always provide visual feedback for gesture states
4. **Haptic Feedback**: Use appropriate haptic feedback for different gesture types
5. **Conflict Prevention**: Ensure gestures don't conflict with system gestures

## Dependencies

- react-native-gesture-handler
- react-native-reanimated
- expo-haptics
- @react-native-async-storage/async-storage

## Future Enhancements

1. Three-finger gestures for bulk operations
2. Gesture customization preferences
3. Gesture recording for tutorials
4. Advanced multi-touch gestures
5. Gesture analytics tracking