// Payment method types
export type PaymentMethodId = 
  | 'easypaisa'
  | 'jazzcash'
  | 'sadapay'
  | 'nayapay'
  | 'bank_transfer'
  | 'card'
  | 'cod';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  type: 'digital_wallet' | 'card' | 'manual' | 'cash';
  description: string;
  icon: string;
  logo?: string;
  processingTime: string;
  minAmount: number;
  maxAmount: number;
  charges?: number;
  enabled: boolean;
  instructions?: string[];
}

export interface PaymentRequest {
  orderId: string;
  paymentMethod: PaymentMethodId;
  amount: number;
  transactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  formData?: Record<string, any>;
  expiresAt: string;
  instructions?: string[];
}

export interface PaymentResult {
  id: string;
  status: 'succeeded' | 'failed' | 'pending';
  method: PaymentMethodId;
  verifiedAt: string;
  amount: number;
  provider?: string;
  transactionId?: string;
  receiptUrl?: string;
}

export interface PaymentProof {
  imageUrl: string;
  transactionRef: string;
  bankName: string;
  transactionDate: string;
  notes?: string;
  uploadedAt: string;
  status: 'pending_review' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface PaymentAttempt {
  method: PaymentMethodId;
  amount: number;
  attemptedAt: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  transactionId?: string;
  error?: string;
}

export interface PaymentStatus {
  orderId: string;
  invoiceNumber: string;
  totalAmount: number;
  isPaid: boolean;
  paidAt?: string;
  paymentMethod: PaymentMethodId;
  orderStatus: string;
  paymentStatus?: string;
  transactionId?: string;
  paymentDate?: string;
  provider?: string;
  codCharges?: number;
  proofStatus?: string;
  proofUploadedAt?: string;
  expiresAt?: string;
  attempts?: PaymentAttempt[];
}

export interface BankTransferDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  iban: string;
  branchCode: string;
  branchName: string;
  swiftCode: string;
  amount: number;
  transactionRef: string;
  customerName: string;
  instructions: string[];
  expiresAt: string;
}

export interface CODDetails {
  amount: number;
  codCharge: number;
  totalPayable: number;
  customerName: string;
  customerPhone: string;
  shippingAddress: any;
  instructions: string[];
  estimatedDelivery: string;
}

export interface PaymentVerificationData {
  transactionId?: string;
  paymentIntentId?: string;
  paymentMethod: PaymentMethodId;
  status: 'success' | 'failed' | 'pending';
  amount?: number;
  orderId?: string;
}

export interface PaymentWebhookPayload {
  provider: PaymentMethodId;
  transactionId: string;
  amount: number;
  status: 'success' | 'failed';
  orderId: string;
  verifiedAt: string;
  data?: Record<string, any>;
}