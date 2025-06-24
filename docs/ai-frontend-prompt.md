# AI Frontend Generation Prompt for Receipt Vault Pro

## How to Use This Prompt

This prompt is designed for AI-driven frontend development tools like:
- Vercel v0 (v0.dev)
- Lovable.ai
- Cursor
- Claude Artifacts
- ChatGPT Canvas

Copy the entire prompt below and paste it into your chosen tool. For best results:
1. Start with the Camera Capture Screen first
2. Then generate the Gallery View
3. Finally create the navigation structure
4. Iterate on each component based on the results

---

## MASTER PROMPT - Receipt Vault Pro Mobile App

### High-Level Goal

Create a React Native mobile application for receipt management with a camera-first interface that works seamlessly across iOS, Android, and Web. The app should feel native on each platform while maintaining a consistent, professional design focused on speed and simplicity.

### Project Context

**Project**: Receipt Vault Pro - A cross-platform receipt management app for small businesses
**Tech Stack**: 
- React Native with Expo (managed workflow)
- React Navigation v6 for routing
- AsyncStorage for metadata
- Expo FileSystem for image storage
- Expo Camera for receipt capture
- TypeScript for type safety

**Design Philosophy**: Camera-first, one-thumb operation, minimal cognitive load

### Visual Design System

**Color Palette**:
```
Primary: #2563EB (Blue - primary actions)
Secondary: #64748B (Gray - secondary elements)
Success: #10B981 (Green - success states, edge detection)
Warning: #F59E0B (Amber - warnings)
Error: #EF4444 (Red - errors)
Background: #F8FAFC (Off-white)
Text Primary: #1E293B
Text Secondary: #64748B
Border: #E2E8F0
```

**Typography**: System fonts (SF Pro on iOS, Roboto on Android)
**Spacing**: 8px base unit (4, 8, 16, 24, 32, 48)
**Border Radius**: 8px default, 16px for cards, 50% for round buttons

### Detailed Implementation Instructions

#### 1. Camera Capture Screen (PRIORITY 1)

Create a full-screen camera interface with receipt edge detection visualization:

```typescript
// File: src/screens/CameraScreen.tsx
```

**Requirements**:
1. Full-screen camera view using Expo Camera
2. Floating capture button: 80px diameter, centered at bottom with 32px margin
3. Top overlay bar with:
   - Flash toggle (left)
   - Gallery shortcut (right) 
   - Close button (far right) if not the default screen
4. Edge detection visualization:
   - Animated green corners when receipt detected
   - Subtle pulse animation (1s duration)
   - "Position receipt within frame" helper text
5. Auto-capture countdown:
   - 3-2-1 countdown overlay when edges detected
   - Can be cancelled by moving device
6. Capture animation:
   - Shutter effect (white flash 100ms)
   - Image shrinks to bottom-right corner
   - Transitions to success state

**Mobile-First Layout**:
- Full viewport height camera
- Bottom button safe area aware
- Top bar respects notch/status bar

**Tablet Adaptation**:
- Maintain 4:3 aspect ratio for camera view
- Center camera with blurred background
- Larger capture button (100px)

**State Management**:
```typescript
interface CameraState {
  hasPermission: boolean;
  isFlashOn: boolean;
  isCapturing: boolean;
  edgesDetected: boolean;
  countdownValue: number | null;
  lastCapture: string | null;
}
```

#### 2. Receipt Gallery View (PRIORITY 2)

Create a responsive grid gallery with search and filtering:

```typescript
// File: src/screens/GalleryScreen.tsx
```

**Requirements**:
1. Grid layout:
   - Mobile: 3 columns, 4px gap
   - Tablet: 4-5 columns, 8px gap
   - Desktop: 6 columns, 8px gap
2. Receipt cards showing:
   - Thumbnail image (aspect-fit)
   - Merchant name (bold, truncated)
   - Amount (monospace font)
   - Date (small, gray)
   - Sync status indicator (corner badge)
3. Floating Action Button:
   - Camera icon, 56px diameter
   - Bottom-right with 16px margin
   - Elevated shadow
4. Search bar:
   - Collapsible on scroll
   - Live search as you type
   - Clear button when active
5. Filter chips below search:
   - Date range
   - Amount range
   - Categories
   - Sync status
6. Multi-select mode:
   - Long press to activate
   - Checkbox overlay on cards
   - Contextual action bar

**Interactions**:
- Pull to refresh with custom animation
- Infinite scroll with loading indicator
- Pinch to change grid size
- Swipe left on card for quick actions

#### 3. Bottom Navigation (PRIORITY 3)

Create platform-aware navigation:

```typescript
// File: src/components/BottomTabNavigator.tsx
```

**Requirements**:
1. Tab items:
   - Gallery (grid icon)
   - Camera (camera icon, larger, centered)
   - Search (search icon)
   - Profile (user icon)
2. Active state:
   - Icon fills in
   - Primary color
   - Subtle scale animation
3. Camera button special:
   - 20% larger than others
   - Raised appearance
   - Always accessible

**Platform Differences**:
- iOS: Blur background, no labels
- Android: Solid background, show labels
- Web: Show labels on hover

### Data Structures

```typescript
interface Receipt {
  id: string;
  imageUri: string;
  thumbnailUri: string;
  merchant: string;
  amount: number;
  date: string;
  category?: string;
  notes?: string;
  isSynced: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserPreferences {
  autoCapture: boolean;
  flashDefault: boolean;
  defaultCategory: string;
  gridSize: 'small' | 'medium' | 'large';
}
```

### API Contracts (Mocked for Frontend)

```typescript
// Mock API responses for frontend development
const mockApi = {
  receipts: {
    getAll: () => Promise<Receipt[]>,
    getById: (id: string) => Promise<Receipt>,
    create: (receipt: Partial<Receipt>) => Promise<Receipt>,
    update: (id: string, data: Partial<Receipt>) => Promise<Receipt>,
    delete: (id: string) => Promise<void>,
    search: (query: string) => Promise<Receipt[]>,
  }
};
```

### Component Library Structure

```
src/
  components/
    common/
      Button.tsx
      Input.tsx
      Card.tsx
    camera/
      CaptureButton.tsx
      EdgeDetection.tsx
      CountdownOverlay.tsx
    gallery/
      ReceiptCard.tsx
      FilterChips.tsx
      SearchBar.tsx
    navigation/
      BottomTabNavigator.tsx
  screens/
    CameraScreen.tsx
    GalleryScreen.tsx
    ReceiptDetailScreen.tsx
    SearchScreen.tsx
    ProfileScreen.tsx
  utils/
    imageProcessing.ts
    localStorage.ts
    mockData.ts
```

### Accessibility Requirements

1. All interactive elements minimum 44x44pt
2. Color contrast 4.5:1 for text
3. Screen reader labels for all icons
4. Keyboard navigation support (web)
5. Reduced motion alternatives

### Performance Constraints

1. Image thumbnails max 150x150px
2. Lazy load gallery images
3. Virtualized list for > 50 items
4. Cache recent searches
5. Debounce search input (300ms)

### What NOT to Include

- DO NOT implement backend API calls
- DO NOT add authentication flows yet
- DO NOT include payment/subscription features
- DO NOT add complex receipt categorization
- DO NOT implement cloud sync logic

### Expected Deliverables

Generate the following files in order:
1. `CameraScreen.tsx` with full edge detection UI
2. `GalleryScreen.tsx` with search and filtering  
3. `BottomTabNavigator.tsx` with platform-specific styling
4. `ReceiptCard.tsx` component with all states
5. `mockData.ts` with 20-30 sample receipts

Each component should be fully styled with inline styles or StyleSheet objects, include proper TypeScript types, handle all edge cases mentioned, and work with mock data.

---

## Additional Notes for Iteration

After generating the initial components, you can iterate by asking for:
- "Add pull-to-refresh animation to the Gallery"
- "Create the receipt detail view with edit capability"
- "Add haptic feedback to all buttons"
- "Implement the search screen with filters"
- "Create onboarding flow screens"

Remember: The generated code will need testing and refinement. Focus on getting the UI structure right first, then iterate on interactions and polish.