import api from './api';
import { 
  PaymentMethod, 
  PaymentRequest, 
  PaymentStatus,
  PaymentVerificationData,
  PaymentProof
} from '../types/payment.types';

export const paymentService = {
  // Get available payment methods
  getPaymentMethods: async (amount: number, city?: string): Promise<PaymentMethod[]> => {
    const response = await api.get('/payments/methods', {
      params: { amount, city }
    });
    return response.data.data;
  },

  // Create payment request
  createPaymentRequest: async (
    orderId: string, 
    paymentMethod: string,
    idempotencyKey?: string
  ): Promise<PaymentRequest> => {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['idempotency-key'] = idempotencyKey;
    }

    const response = await api.post(
      `/payments/create/${orderId}`,
      { paymentMethod },
      { headers }
    );
    return response.data.data;
  },

  // Confirm payment
  confirmPayment: async (
    orderId: string,
    verificationData: PaymentVerificationData
  ): Promise<any> => {
    const response = await api.post(`/payments/confirm/${orderId}`, verificationData);
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (orderId: string): Promise<PaymentStatus> => {
    const response = await api.get(`/payments/status/${orderId}`);
    return response.data.data;
  },

  // Upload payment proof
  uploadPaymentProof: async (
    orderId: string,
    data: {
      transactionRef: string;
      bankName: string;
      transactionDate: string;
      notes?: string;
      proofImage: File;
    }
  ): Promise<{ orderId: string; proofStatus: string; message: string }> => {
    const formData = new FormData();
    formData.append('proof', data.proofImage);
    formData.append('transactionRef', data.transactionRef);
    formData.append('bankName', data.bankName);
    formData.append('transactionDate', data.transactionDate);
    if (data.notes) formData.append('notes', data.notes);

    const response = await api.post(`/payments/${orderId}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Get pending payment proofs (admin)
  getPendingProofs: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    orders: any[];
    pagination: { page: number; limit: number; total: number; pages: number };
    stats: { pending: number; approved: number; rejected: number; total: number };
  }> => {
    const response = await api.get('/payments/pending-proofs', { params });
    return response.data.data;
  },

  // Verify manual payment (admin)
  verifyManualPayment: async (
    orderId: string,
    data: {
      status: 'approved' | 'rejected';
      reviewNotes?: string;
    }
  ): Promise<any> => {
    const response = await api.post(`/payments/${orderId}/verify-manual`, data);
    return response.data;
  },

  // Generate idempotency key
  generateIdempotencyKey: (orderId: string, paymentMethod: string): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${orderId}-${paymentMethod}-${timestamp}-${random}`;
  },

  // Format payment amount
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Validate payment amount
  validateAmount: (amount: number, method: PaymentMethod): boolean => {
    return amount >= method.minAmount && amount <= method.maxAmount;
  },

  // Get payment method icon
  getMethodIcon: (methodId: string): string => {
    const icons: Record<string, string> = {
      'easypaisa': '📱',
      'jazzcash': '💳',
      'sadapay': '💳',
      'nayapay': '💳',
      'bank_transfer': '🏦',
      'card': '💳',
      'cod': '💰'
    };
    return icons[methodId] || '💳';
  },

  // Get payment method color
  getMethodColor: (methodId: string): string => {
    const colors: Record<string, string> = {
      'easypaisa': 'blue',
      'jazzcash': 'green',
      'sadapay': 'purple',
      'nayapay': 'indigo',
      'bank_transfer': 'yellow',
      'card': 'red',
      'cod': 'gray'
    };
    return colors[methodId] || 'blue';
  }
};