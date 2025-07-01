import { Receipt } from '../contexts/NormalizedReceiptContext';

// Realistic merchant names by category
const merchantsByCategory = {
  'Groceries': [
    'Whole Foods Market',
    'Trader Joe\'s',
    'Kroger',
    'Safeway',
    'Walmart Grocery',
    'Target',
    'Costco Wholesale',
    'Publix',
    'H-E-B',
    'Wegmans',
  ],
  'Electronics': [
    'Best Buy',
    'Apple Store',
    'Micro Center',
    'Newegg',
    'B&H Photo',
    'Fry\'s Electronics',
    'GameStop',
  ],
  'Food & Dining': [
    'Starbucks',
    'McDonald\'s',
    'Chipotle Mexican Grill',
    'Subway',
    'Chick-fil-A',
    'Olive Garden',
    'Panera Bread',
    'Five Guys',
    'Domino\'s Pizza',
    'Taco Bell',
  ],
  'Gas': [
    'Shell',
    'Chevron',
    'ExxonMobil',
    'BP',
    'Speedway',
    'Circle K',
    '7-Eleven',
    'Wawa',
  ],
  'Home Improvement': [
    'Home Depot',
    'Lowe\'s',
    'Menards',
    'Ace Hardware',
    'True Value',
  ],
  'Coffee': [
    'Starbucks',
    'Dunkin\'',
    'Peet\'s Coffee',
    'Dutch Bros',
    'Tim Hortons',
    'The Coffee Bean',
  ],
  'Retail': [
    'Amazon',
    'Target',
    'Walmart',
    'CVS Pharmacy',
    'Walgreens',
    'Rite Aid',
    'Dollar General',
    'Ross Dress for Less',
    'TJ Maxx',
    'Nordstrom',
  ],
  'Transportation': [
    'Uber',
    'Lyft',
    'Enterprise Rent-A-Car',
    'Hertz',
    'Budget Car Rental',
    'Yellow Cab',
  ],
};

// Generate random amount based on category
const getRandomAmount = (category: string): number => {
  const ranges = {
    'Groceries': { min: 25, max: 300 },
    'Electronics': { min: 50, max: 2000 },
    'Food & Dining': { min: 8, max: 80 },
    'Gas': { min: 30, max: 100 },
    'Home Improvement': { min: 15, max: 500 },
    'Coffee': { min: 3, max: 15 },
    'Retail': { min: 10, max: 400 },
    'Transportation': { min: 10, max: 150 },
  };

  const range = ranges[category as keyof typeof ranges] || { min: 10, max: 200 };
  return Math.round((Math.random() * (range.max - range.min) + range.min) * 100) / 100;
};

// Generate random date within the last 60 days
const getRandomDate = (daysAgo: number = 60): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString().split('T')[0];
};

// Generate timestamp
const getRandomTimestamp = (daysAgo: number = 60): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date.toISOString();
};

// Mock receipt data generator
export const generateMockReceipts = (count: number = 30): Receipt[] => {
  const categories = Object.keys(merchantsByCategory);
  const receipts: Receipt[] = [];

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const merchants = merchantsByCategory[category as keyof typeof merchantsByCategory];
    const merchant = merchants[Math.floor(Math.random() * merchants.length)];
    const date = getRandomDate();
    const createdAt = getRandomTimestamp();
    
    // Make recent receipts more likely to be unsynced
    const daysSinceCreation = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const syncProbability = daysSinceCreation > 7 ? 0.9 : 0.6;
    
    receipts.push({
      id: `receipt-${i + 1}`,
      imageUri: `https://picsum.photos/400/600?random=${i + 1}`,
      thumbnailUri: `https://picsum.photos/150/150?random=${i + 1}`,
      merchant,
      amount: getRandomAmount(category),
      date,
      category,
      notes: Math.random() > 0.7 ? `${category} purchase - ${merchant}` : undefined,
      isSynced: Math.random() < syncProbability,
      createdAt,
      updatedAt: createdAt,
    });
  }

  // Sort by date, most recent first
  return receipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Pre-generated mock data for consistent testing
export const mockReceipts: Receipt[] = [
  {
    id: 'receipt-1',
    imageUri: 'https://picsum.photos/400/600?random=1',
    thumbnailUri: 'https://picsum.photos/150/150?random=1',
    merchant: 'Whole Foods Market',
    amount: 156.43,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Groceries',
    notes: 'Weekly grocery shopping',
    isSynced: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-2',
    imageUri: 'https://picsum.photos/400/600?random=2',
    thumbnailUri: 'https://picsum.photos/150/150?random=2',
    merchant: 'Shell',
    amount: 68.54,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Gas',
    isSynced: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-3',
    imageUri: 'https://picsum.photos/400/600?random=3',
    thumbnailUri: 'https://picsum.photos/150/150?random=3',
    merchant: 'Starbucks',
    amount: 6.85,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Coffee',
    isSynced: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-4',
    imageUri: 'https://picsum.photos/400/600?random=4',
    thumbnailUri: 'https://picsum.photos/150/150?random=4',
    merchant: 'Best Buy',
    amount: 349.99,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Electronics',
    notes: 'New headphones',
    isSynced: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-5',
    imageUri: 'https://picsum.photos/400/600?random=5',
    thumbnailUri: 'https://picsum.photos/150/150?random=5',
    merchant: 'Chipotle Mexican Grill',
    amount: 12.47,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Food & Dining',
    isSynced: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-6',
    imageUri: 'https://picsum.photos/400/600?random=6',
    thumbnailUri: 'https://picsum.photos/150/150?random=6',
    merchant: 'Home Depot',
    amount: 87.63,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Home Improvement',
    notes: 'Paint and supplies',
    isSynced: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-7',
    imageUri: 'https://picsum.photos/400/600?random=7',
    thumbnailUri: 'https://picsum.photos/150/150?random=7',
    merchant: 'Target',
    amount: 234.18,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Retail',
    isSynced: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-8',
    imageUri: 'https://picsum.photos/400/600?random=8',
    thumbnailUri: 'https://picsum.photos/150/150?random=8',
    merchant: 'Uber',
    amount: 23.76,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Transportation',
    isSynced: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-9',
    imageUri: 'https://picsum.photos/400/600?random=9',
    thumbnailUri: 'https://picsum.photos/150/150?random=9',
    merchant: 'Costco Wholesale',
    amount: 312.54,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Groceries',
    notes: 'Bulk shopping',
    isSynced: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-10',
    imageUri: 'https://picsum.photos/400/600?random=10',
    thumbnailUri: 'https://picsum.photos/150/150?random=10',
    merchant: 'Starbucks',
    amount: 5.65,
    date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Coffee',
    isSynced: true,
    createdAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-11',
    imageUri: 'https://picsum.photos/400/600?random=11',
    thumbnailUri: 'https://picsum.photos/150/150?random=11',
    merchant: 'CVS Pharmacy',
    amount: 45.32,
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Retail',
    notes: 'Pharmacy items',
    isSynced: false,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-12',
    imageUri: 'https://picsum.photos/400/600?random=12',
    thumbnailUri: 'https://picsum.photos/150/150?random=12',
    merchant: 'Five Guys',
    amount: 18.94,
    date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Food & Dining',
    isSynced: true,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-13',
    imageUri: 'https://picsum.photos/400/600?random=13',
    thumbnailUri: 'https://picsum.photos/150/150?random=13',
    merchant: 'Chevron',
    amount: 72.18,
    date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Gas',
    isSynced: true,
    createdAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-14',
    imageUri: 'https://picsum.photos/400/600?random=14',
    thumbnailUri: 'https://picsum.photos/150/150?random=14',
    merchant: 'Apple Store',
    amount: 1299.00,
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Electronics',
    notes: 'iPhone upgrade',
    isSynced: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-15',
    imageUri: 'https://picsum.photos/400/600?random=15',
    thumbnailUri: 'https://picsum.photos/150/150?random=15',
    merchant: 'Trader Joe\'s',
    amount: 67.43,
    date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Groceries',
    isSynced: false,
    createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-16',
    imageUri: 'https://picsum.photos/400/600?random=16',
    thumbnailUri: 'https://picsum.photos/150/150?random=16',
    merchant: 'McDonald\'s',
    amount: 8.76,
    date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Food & Dining',
    isSynced: true,
    createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-17',
    imageUri: 'https://picsum.photos/400/600?random=17',
    thumbnailUri: 'https://picsum.photos/150/150?random=17',
    merchant: 'Lowe\'s',
    amount: 156.89,
    date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Home Improvement',
    notes: 'Garden supplies',
    isSynced: true,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-18',
    imageUri: 'https://picsum.photos/400/600?random=18',
    thumbnailUri: 'https://picsum.photos/150/150?random=18',
    merchant: 'Dunkin\'',
    amount: 4.29,
    date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Coffee',
    isSynced: true,
    createdAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-19',
    imageUri: 'https://picsum.photos/400/600?random=19',
    thumbnailUri: 'https://picsum.photos/150/150?random=19',
    merchant: 'Amazon',
    amount: 89.97,
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Retail',
    notes: 'Office supplies',
    isSynced: false,
    createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-20',
    imageUri: 'https://picsum.photos/400/600?random=20',
    thumbnailUri: 'https://picsum.photos/150/150?random=20',
    merchant: 'ExxonMobil',
    amount: 65.43,
    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Gas',
    isSynced: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-21',
    imageUri: 'https://picsum.photos/400/600?random=21',
    thumbnailUri: 'https://picsum.photos/150/150?random=21',
    merchant: 'Panera Bread',
    amount: 14.87,
    date: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Food & Dining',
    isSynced: true,
    createdAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 32 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-22',
    imageUri: 'https://picsum.photos/400/600?random=22',
    thumbnailUri: 'https://picsum.photos/150/150?random=22',
    merchant: 'Walmart',
    amount: 127.65,
    date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Retail',
    isSynced: false,
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-23',
    imageUri: 'https://picsum.photos/400/600?random=23',
    thumbnailUri: 'https://picsum.photos/150/150?random=23',
    merchant: 'Lyft',
    amount: 18.32,
    date: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Transportation',
    isSynced: true,
    createdAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 37 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-24',
    imageUri: 'https://picsum.photos/400/600?random=24',
    thumbnailUri: 'https://picsum.photos/150/150?random=24',
    merchant: 'Safeway',
    amount: 98.76,
    date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Groceries',
    isSynced: true,
    createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'receipt-25',
    imageUri: 'https://picsum.photos/400/600?random=25',
    thumbnailUri: 'https://picsum.photos/150/150?random=25',
    merchant: 'GameStop',
    amount: 59.99,
    date: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: 'Electronics',
    notes: 'New game',
    isSynced: false,
    createdAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Mock API implementation
export const mockApi = {
  receipts: {
    getAll: (): Promise<Receipt[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockReceipts);
        }, 1000);
      });
    },
    
    getById: (id: string): Promise<Receipt> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const receipt = mockReceipts.find(r => r.id === id);
          if (receipt) {
            resolve(receipt);
          } else {
            reject(new Error('Receipt not found'));
          }
        }, 500);
      });
    },
    
    create: (receipt: Partial<Receipt>): Promise<Receipt> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newReceipt: Receipt = {
            id: `receipt-${Date.now()}`,
            imageUri: receipt.imageUri || 'https://picsum.photos/400/600',
            thumbnailUri: receipt.thumbnailUri || 'https://picsum.photos/150/150',
            merchant: receipt.merchant || 'Unknown Merchant',
            amount: receipt.amount || 0,
            date: receipt.date || new Date().toISOString().split('T')[0],
            category: receipt.category,
            notes: receipt.notes,
            isSynced: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          mockReceipts.unshift(newReceipt);
          resolve(newReceipt);
        }, 1000);
      });
    },
    
    update: (id: string, data: Partial<Receipt>): Promise<Receipt> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockReceipts.findIndex(r => r.id === id);
          if (index !== -1) {
            mockReceipts[index] = {
              ...mockReceipts[index],
              ...data,
              updatedAt: new Date().toISOString(),
            };
            resolve(mockReceipts[index]);
          } else {
            reject(new Error('Receipt not found'));
          }
        }, 500);
      });
    },
    
    delete: (id: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const index = mockReceipts.findIndex(r => r.id === id);
          if (index !== -1) {
            mockReceipts.splice(index, 1);
            resolve();
          } else {
            reject(new Error('Receipt not found'));
          }
        }, 500);
      });
    },
    
    search: (query: string): Promise<Receipt[]> => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const lowerQuery = query.toLowerCase();
          const results = mockReceipts.filter(receipt =>
            receipt.merchant.toLowerCase().includes(lowerQuery) ||
            receipt.amount.toString().includes(lowerQuery) ||
            receipt.category?.toLowerCase().includes(lowerQuery) ||
            receipt.notes?.toLowerCase().includes(lowerQuery)
          );
          resolve(results);
        }, 500);
      });
    },
  }
};