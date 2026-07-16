import api from './api';
import type { Order, ShippingAddress } from '../types';
import { generateDeliverySlipHTML } from '../utils/deliverySlipGenerator';

type CreateOrderData = {
  orderItems: Array<{
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    sku: string;
    variant?: string;
    selectedAttributes?: Record<string, string>;
    selectedColor?: { name: string; value: string };
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: Order['paymentMethod'];
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  coupon?: { code: string; discount: number; discountType?: 'percentage' | 'fixed' };
  notes?: string;
  shippingMethod: 'normal' | 'express';
};

type PaymentProofData = {
  transactionRef: string;
  bankName: string;
  transactionDate: string;
  notes?: string;
  proofImage: File;
};

export const orderService = {
  createOrder: async (data: CreateOrderData) => (await api.post('/orders', data)).data,

  getOrderById: async (id: string) => (await api.get(`/orders/${id}`)).data,

  getPaymentMethods: async (amount?: number) => (
    await api.get('/orders/payment/methods', { params: { amount } })
  ).data,

  getShippingMethods: async () => (await api.get('/orders/shipping-methods')).data,

  calculateShipping: async (city: string, deliveryMethod: 'normal' | 'express') => (
    await api.post('/orders/shipping/estimate', { city, deliveryMethod })
  ).data,

  createPaymentRequest: async (
    orderId: string,
    paymentMethod: string,
    paymentData?: Record<string, unknown>,
  ) => (await api.post(`/orders/${orderId}/payment/request`, { paymentMethod, ...paymentData })).data,

  uploadPaymentProof: async (orderId: string, data: PaymentProofData) => {
    const formData = new FormData();
    formData.append('proof', data.proofImage);
    formData.append('transactionRef', data.transactionRef);
    formData.append('bankName', data.bankName);
    formData.append('transactionDate', data.transactionDate);
    if (data.notes) formData.append('notes', data.notes);
    return (await api.post(`/orders/${orderId}/payment/proof`, formData)).data;
  },

  getInvoice: async (orderId: string) => (await api.get(`/orders/${orderId}/invoice`)).data,

  requestRefund: async (orderId: string, data: { reason: string }) => (
    await api.post(`/orders/${orderId}/refund`, data)
  ).data,

  downloadDeliverySlip: async (orderId: string, orderNumber: string) => {
    const response = await api.get(`/orders/${orderId}/delivery-slip`);
    const html = generateDeliverySlipHTML(response.data.data);
    const url = window.URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `delivery-slip-${orderNumber}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true };
  },
};
