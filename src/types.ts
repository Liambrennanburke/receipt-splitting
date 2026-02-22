export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[]; // person IDs
}

export interface Person {
  id: string;
  name: string;
  color: string;
}

export type SplitMode = 'proportional' | 'even';

export interface ReceiptData {
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
}
