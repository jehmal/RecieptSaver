// Receipt detail component types

export interface Receipt {
  id: string;
  merchantName: string;
  category: string;
  amount: string;
  date: string;
  time: string;
  paymentMethod: string;
  imageUri?: string;
  tags: Tag[];
}

export interface Tag {
  id: string;
  label: string;
  isSelected: boolean;
}

export interface ReceiptImageViewerProps {
  imageUri?: string;
  onError?: () => void;
}

export interface ReceiptInfoGridProps {
  amount: string;
  date: string;
  paymentMethod: string;
  time: string;
}

export interface ReceiptTagsProps {
  tags: Tag[];
  onTagPress: (tagId: string) => void;
  onAddTag: () => void;
}

export interface ActionButtonsProps {
  onExport: () => void;
  onShare: () => void;
}