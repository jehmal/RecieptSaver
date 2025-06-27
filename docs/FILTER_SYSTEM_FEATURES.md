# Advanced Filter System Features

## Overview
The new filter system provides a sophisticated two-row filter interface with advanced filtering capabilities for the search screen.

## Features

### 1. Two-Row Filter Pills
- **Row 1: Category Filters**
  - Pre-defined categories: Groceries, Restaurants, Transportation, Shopping, Healthcare, Entertainment, Travel, Utilities, Office Supplies, Equipment
  - Add custom categories with the + button
  - Multiple category selection supported
  - Visual feedback with selected state

- **Row 2: Date Range & Advanced Filters**
  - Quick date filters: Today, This Week, This Month, All Time
  - Advanced Filters button with badge showing active filter count
  - Smooth animations and transitions

### 2. Advanced Filter Sheet
Opens as a modal bottom sheet with expandable sections:

#### Price Range
- Min/Max input fields
- Interactive slider for maximum price
- Range: $0 - $10,000+

#### Supplier
- Pre-defined supplier list
- Single selection chips
- Options: Amazon, Apple Store, Best Buy, Costco, Home Depot, Target, Walmart, Whole Foods, Other

#### Tags
- Multi-select chips
- Filter by receipt tags

#### Team Member
- Filter by who uploaded/paid
- Options: John Smith, Jane Doe, Mike Johnson, Sarah Williams, Other

#### GST Status
- Filter by tax status
- Options: Included, Excluded, Mixed

#### Warranty Status
- Filter by warranty validity
- Options: Valid, Expired, Expiring Soon

#### Receipt Type
- Filter by payment method
- Options: Cash, EFTPOS, Reimbursable, Statement Match

#### Reimbursement Status
- Track reimbursement workflow
- Options: Paid, Pending, Awaiting Approval

#### Job Site
- Filter by location/project
- Options: Main Office, Construction Site A, Client Location - Downtown, Warehouse, Remote

#### Subscription
- Toggle for recurring vendor flag
- Identify subscription-based purchases

## UI/UX Features

### Visual Design
- Dark theme with glass morphism aesthetic
- Smooth animations for all interactions
- Expandable/collapsible sections in advanced filters
- Visual feedback for selected states
- Badge indicator for active advanced filters

### Interaction Design
- Horizontal scrolling for filter pills
- Modal presentation for advanced filters
- Touch-friendly tap targets
- Clear visual hierarchy
- Reset functionality for quick filter clearing

### Performance
- Memoized filter calculations
- Efficient re-rendering
- Smooth 60fps animations
- Optimized for large datasets

## Implementation Details

### Filter State Management
```typescript
interface FilterState {
  categories: string[];
  customCategories: string[];
  dateRange: 'Today' | 'This Week' | 'This Month' | 'All Time' | 'Custom';
  customDateRange?: { start: Date; end: Date };
  priceRange: { min: number; max: number };
  supplier?: string;
  tags: string[];
  teamMember?: string;
  gstStatus?: 'Included' | 'Excluded' | 'Mixed';
  warrantyStatus?: 'Valid' | 'Expired' | 'Expiring Soon';
  receiptType?: 'Cash' | 'EFTPOS' | 'Reimbursable' | 'Statement Match';
  reimbursementStatus?: 'Paid' | 'Pending' | 'Awaiting Approval';
  jobSite?: string;
  subscription?: boolean;
}
```

### Component Structure
1. **FilterPills**: Two-row filter interface with category and date filters
2. **AdvancedFilterSheet**: Modal bottom sheet with all advanced filter options
3. **SearchScreen**: Main screen integrating all filter components

## Usage

1. **Basic Filtering**
   - Tap category pills to filter by category
   - Tap date range pills for quick time-based filtering
   - Use the + button to add custom categories

2. **Advanced Filtering**
   - Tap "Advanced Filters" button
   - Expand sections to access specific filters
   - Adjust price range using slider or input fields
   - Select multiple filters across different categories
   - Tap "Apply Filters" to apply changes
   - Use "Reset" to clear all filters

3. **Filter Combinations**
   - All filters work together (AND logic)
   - See filter count badge for active advanced filters
   - Search bar works in conjunction with all filters

## Future Enhancements
- Save filter presets
- Custom date range picker
- Export filtered results
- Filter by attachment type
- Smart filter suggestions based on usage