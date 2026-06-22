export interface ReceiptItem {
  date: string;
  qty: string;
  rate: string;
  amount: string;
}

export interface ReceiptData {
  id: string;
  createdAt: number;
  receiptNo: string;
  date: string;
  customerName: string;
  items: ReceiptItem[];
  previousBalance: string;
  received: string;
  signatureName?: 'Murtaza' | 'Qurban Ali';
}
