export interface FilterState {
  // Category filters
  categories: string[];
  customCategories: string[];
  
  // Date filters
  dateRange: 'Today' | 'This Week' | 'This Month' | 'All Time' | 'Custom';
  customDateRange?: {
    start: Date;
    end: Date;
  };
  
  // Advanced filters
  priceRange: {
    min: number;
    max: number;
  };
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

export const defaultFilterState: FilterState = {
  categories: [],
  customCategories: [],
  dateRange: 'This Month',
  priceRange: {
    min: 0,
    max: 10000,
  },
  tags: [],
};

export const categoryOptions = [
  'Groceries',
  'Restaurants',
  'Transportation',
  'Shopping',
  'Healthcare',
  'Entertainment',
  'Travel',
  'Utilities',
  'Office Supplies',
  'Equipment',
];

export const supplierOptions = [
  'Amazon',
  'Apple Store',
  'Best Buy',
  'Costco',
  'Home Depot',
  'Target',
  'Walmart',
  'Whole Foods',
  'Other',
];

export const teamMemberOptions = [
  'John Smith',
  'Jane Doe',
  'Mike Johnson',
  'Sarah Williams',
  'Other',
];

export const jobSiteOptions = [
  'Main Office',
  'Construction Site A',
  'Client Location - Downtown',
  'Warehouse',
  'Remote',
];