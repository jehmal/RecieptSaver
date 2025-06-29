// Form validation utilities for receipt editing

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message: string;
}

export interface ValidationRules {
  [field: string]: ValidationRule[];
}

export interface ValidationErrors {
  [field: string]: string;
}

export const validateField = (value: any, rules: ValidationRule[]): string | null => {
  for (const rule of rules) {
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.message;
    }

    if (rule.minLength && value && value.toString().length < rule.minLength) {
      return rule.message;
    }

    if (rule.maxLength && value && value.toString().length > rule.maxLength) {
      return rule.message;
    }

    if (rule.pattern && value && !rule.pattern.test(value.toString())) {
      return rule.message;
    }

    if (rule.custom && !rule.custom(value)) {
      return rule.message;
    }
  }

  return null;
};

export const validateForm = (formData: any, rules: ValidationRules): ValidationErrors => {
  const errors: ValidationErrors = {};

  Object.keys(rules).forEach((field) => {
    const error = validateField(formData[field], rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
};

// Receipt-specific validation rules
export const receiptValidationRules: ValidationRules = {
  merchant: [
    { required: true, message: 'Merchant name is required' },
    { minLength: 2, message: 'Merchant name must be at least 2 characters' },
    { maxLength: 100, message: 'Merchant name must be less than 100 characters' },
  ],
  amount: [
    { required: true, message: 'Amount is required' },
    {
      pattern: /^\d+(\.\d{0,2})?$/,
      message: 'Amount must be a valid number with up to 2 decimal places',
    },
    {
      custom: (value) => parseFloat(value) > 0,
      message: 'Amount must be greater than 0',
    },
  ],
  date: [
    { required: true, message: 'Date is required' },
    {
      custom: (value) => {
        const date = new Date(value);
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return date <= today;
      },
      message: 'Date cannot be in the future',
    },
  ],
  category: [
    { required: true, message: 'Category is required' },
  ],
};

// Item validation rules
export const itemValidationRules: ValidationRules = {
  name: [
    { required: true, message: 'Item name is required' },
    { minLength: 1, message: 'Item name cannot be empty' },
    { maxLength: 100, message: 'Item name must be less than 100 characters' },
  ],
  quantity: [
    { required: true, message: 'Quantity is required' },
    {
      pattern: /^\d+$/,
      message: 'Quantity must be a whole number',
    },
    {
      custom: (value) => parseInt(value) > 0,
      message: 'Quantity must be greater than 0',
    },
  ],
  price: [
    { required: true, message: 'Price is required' },
    {
      pattern: /^\d+(\.\d{0,2})?$/,
      message: 'Price must be a valid number with up to 2 decimal places',
    },
    {
      custom: (value) => parseFloat(value) >= 0,
      message: 'Price cannot be negative',
    },
  ],
};

// Helper functions
export const formatCurrency = (value: string): string => {
  // Remove non-numeric characters except decimal point
  const numericValue = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = numericValue.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (parts.length === 2 && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return numericValue;
};

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};