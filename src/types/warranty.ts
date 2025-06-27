export interface Warranty {
  id: string;
  itemName: string;
  serialNumber: string;
  purchaseDate: string;
  expiryDate: string;
  supplier: string;
  category?: string;
  notes?: string;
  receiptId?: string; // Link to associated receipt if available
  createdAt: string;
  updatedAt: string;
}

export interface WarrantySearchResult {
  warranty: Warranty;
  matchType: 'itemName' | 'serialNumber' | 'supplier';
  matchScore: number;
}

// Helper functions for warranty management
export const calculateWarrantyStatus = (expiryDate: string): {
  daysRemaining: number;
  status: 'active' | 'expiring' | 'expired';
  urgency: 'low' | 'medium' | 'high';
} => {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: 'active' | 'expiring' | 'expired';
  let urgency: 'low' | 'medium' | 'high';
  
  if (daysRemaining <= 0) {
    status = 'expired';
    urgency = 'high';
  } else if (daysRemaining <= 30) {
    status = 'expiring';
    urgency = 'high';
  } else if (daysRemaining <= 90) {
    status = 'expiring';
    urgency = 'medium';
  } else {
    status = 'active';
    urgency = 'low';
  }
  
  return { daysRemaining, status, urgency };
};

export const sortWarrantiesByExpiry = (warranties: Warranty[]): Warranty[] => {
  return [...warranties].sort((a, b) => {
    const aExpiry = new Date(a.expiryDate).getTime();
    const bExpiry = new Date(b.expiryDate).getTime();
    return aExpiry - bExpiry;
  });
};

export const searchWarranties = (
  warranties: Warranty[],
  query: string
): WarrantySearchResult[] => {
  const lowerQuery = query.toLowerCase();
  const results: WarrantySearchResult[] = [];
  
  warranties.forEach(warranty => {
    let matchScore = 0;
    let matchType: 'itemName' | 'serialNumber' | 'supplier' | null = null;
    
    // Check item name
    if (warranty.itemName.toLowerCase().includes(lowerQuery)) {
      matchScore = warranty.itemName.toLowerCase().startsWith(lowerQuery) ? 10 : 5;
      matchType = 'itemName';
    }
    
    // Check serial number
    if (warranty.serialNumber.toLowerCase().includes(lowerQuery)) {
      const serialScore = warranty.serialNumber.toLowerCase().startsWith(lowerQuery) ? 8 : 4;
      if (serialScore > matchScore) {
        matchScore = serialScore;
        matchType = 'serialNumber';
      }
    }
    
    // Check supplier
    if (warranty.supplier.toLowerCase().includes(lowerQuery)) {
      const supplierScore = warranty.supplier.toLowerCase().startsWith(lowerQuery) ? 6 : 3;
      if (supplierScore > matchScore) {
        matchScore = supplierScore;
        matchType = 'supplier';
      }
    }
    
    if (matchType && matchScore > 0) {
      results.push({ warranty, matchType, matchScore });
    }
  });
  
  // Sort by match score (highest first)
  return results.sort((a, b) => b.matchScore - a.matchScore);
};