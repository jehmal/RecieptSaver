export interface WarrantyAction {
  id: string;
  type: 'renewal_reminder' | 'file_claim' | 'extend_warranty' | 'contact_support';
  label: string;
  icon: string;
  color: string;
  requiresAuth?: boolean;
}

export interface RenewalReminder {
  warrantyId: string;
  reminderDate: string;
  notificationTime: 'morning' | 'afternoon' | 'evening';
  isEnabled: boolean;
  createdAt: string;
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  issueDescription: string;
  claimDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  claimNumber?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreference {
  warrantyId: string;
  daysBeforeExpiry: number[]; // e.g., [30, 14, 7, 1]
  notificationTime: string; // e.g., "09:00"
  isEnabled: boolean;
}

export const warrantyActions: WarrantyAction[] = [
  {
    id: 'renewal',
    type: 'renewal_reminder',
    label: 'Set Renewal Reminder',
    icon: 'notifications-outline',
    color: '#007AFF',
  },
  {
    id: 'claim',
    type: 'file_claim',
    label: 'File a Claim',
    icon: 'document-text-outline',
    color: '#FF9500',
  },
  {
    id: 'extend',
    type: 'extend_warranty',
    label: 'Extend Warranty',
    icon: 'time-outline',
    color: '#34C759',
  },
  {
    id: 'support',
    type: 'contact_support',
    label: 'Contact Support',
    icon: 'call-outline',
    color: '#5856D6',
  },
];