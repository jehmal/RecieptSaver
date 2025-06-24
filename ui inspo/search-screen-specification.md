# Receipt Search Screen UI Specification

Based on Blackbird iOS 38 design, adapted for Receipt Vault Pro search functionality.

## Overall Design

### Header Section
- **Back Arrow**: 24x24px chevron-left icon
- **Title**: "My Receipts" centered (instead of "My Activity")
- **Background**: White (#FFFFFF)
- **Status Bar**: Standard iOS style

### Summary Section
- **Large Total**: Current month total (e.g., "$2,348.67")
- **Subtitle**: "OCTOBER TOTAL" in #8E8E93 gray
- **Action Button**: Black pill button with filter icon + "Filter" text
  - Height: 48px
  - Background: #1C1C1E
  - Text: White
  - Corner radius: 24px

### Filter Bar (Below Summary)
- **Horizontal scrollable pills** for quick filters:
  - Date ranges: "Today", "This Week", "This Month", "Custom"
  - Tags: Dynamic based on user's tags
- **Pill Style**:
  - Selected: #1C1C1E background, white text
  - Unselected: #E5E5EA background, #1C1C1E text
  - Height: 36px
  - Padding: 12px horizontal

### Receipt List Section
- **Section Headers**: Month groupings (e.g., "October 2024", "September 2024")
- **Receipt Cards**: 
  - Height: 100px
  - White background with subtle shadow
  - Padding: 16px
  - Corner radius: 16px
  - Margin: 8px horizontal, 4px vertical

### Receipt Card Layout
```
[Thumbnail] | Merchant Name        | $Amount
            | Category • Date       | [Tags]
            | Payment Method        |
```

### Tag System
- **Small pill tags** on each receipt
- **Tag Style**:
  - Height: 24px
  - Font size: 12px
  - Padding: 6px horizontal
  - Multiple colors based on category:
    - Business: Blue (#007AFF)
    - Personal: Green (#34C759)
    - Tax Deductible: Purple (#AF52DE)
    - Reimbursable: Orange (#FF9500)
    - Custom tags: Gray (#8E8E93)

### Search Bar (Sticky at top when scrolling)
- **Height**: 44px
- **Background**: #F5F5F7
- **Corner radius**: 10px
- **Placeholder**: "Search receipts, merchants, amounts..."
- **Icon**: Magnifying glass on left

## Component Structure

### ReceiptSearchScreen.tsx
Main screen component with:
- Search functionality
- Filter state management
- Receipt grouping by date

### Components needed:
1. **SearchBar.tsx** - Sticky search input
2. **FilterPills.tsx** - Horizontal scrollable filters
3. **ReceiptListItem.tsx** - Individual receipt card
4. **TagPill.tsx** - Reusable tag component
5. **MonthSection.tsx** - Section header for month grouping

## Features

### Search Capabilities:
- Merchant name
- Amount (exact or range)
- Tags
- Date
- Payment method
- Notes/description

### Filter Options:
1. **Date Range**:
   - Preset options
   - Custom date picker

2. **Tags**:
   - Multi-select
   - Show count next to each tag

3. **Amount Range**:
   - Min/max sliders

4. **Categories**:
   - Predefined categories
   - Custom categories

### Tag Management:
- Tap tag to filter by it
- Long press to edit/delete
- Add new tags from receipt detail view
- Bulk tag operations

### Sorting Options:
- Date (newest/oldest)
- Amount (high/low)
- Merchant (A-Z)
- Most recent activity

## Interactions

### Pull to Refresh
- Updates receipt list
- Syncs any cloud changes

### Swipe Actions on Receipt Cards:
- Swipe left: Delete
- Swipe right: Quick tag options

### Tap Actions:
- Tap receipt: Open detail view
- Tap tag: Filter by that tag
- Tap filter button: Open advanced filters

### Long Press:
- Multi-select mode for bulk operations
- Tag management

## Animation Specifications

### List Animations:
- Fade in new receipts
- Smooth section transitions
- Stagger animation when filtering

### Search Bar:
- Smooth transition to sticky position
- Clear button animation

### Filter Pills:
- Smooth horizontal scroll
- Scale animation on selection

## Color Adaptations for Receipts

Keep Blackbird's clean aesthetic but adapt content:
- Replace $FLY amounts with receipt amounts
- Replace venue icons with receipt thumbnails
- Use date instead of rewards text
- Add tag pills for categorization