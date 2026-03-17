

// src/services/orderService.ts
import api from './api'
import { Order, PaymentMethod, ShippingAddress } from '../types'
import { generateDeliverySlipHTML } from '../utils/deliverySlipGenerator' // ✅ IMPORT ADDED

export const orderService = {
  // Create new order
  createOrder: async (data: {
    orderItems: Array<{
      product: string
      name: string
      image: string
      price: number
      quantity: number
      sku: string
      variant?: string
    }>
    shippingAddress: ShippingAddress
    paymentMethod: Order['paymentMethod']
    itemsPrice: number
    shippingPrice: number
    taxPrice: number
    totalPrice: number
    coupon?: {
      code: string
      discount: number
      discountType?: 'percentage' | 'fixed'
    }
    notes?: string
  }) => {
    try {
      const response = await api.post('/orders', data)
      return response.data
    } catch (error: any) {
      console.error('Create order error:', error.response?.data || error.message)
      throw error
    }
  },

  // Get user orders
  getMyOrders: async (params?: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
  }) => {
    try {
      const response = await api.get('/orders/my-orders', { params })
      return response.data
    } catch (error: any) {
      console.error('Get my orders error:', error.response?.data || error.message)
      throw error
    }
  },

  // Get order by ID
  getOrderById: async (id: string) => {
    try {
      const response = await api.get(`/orders/${id}`)
      return response.data
    } catch (error: any) {
      console.error(`Get order ${id} error:`, error.response?.data || error.message)
      throw error
    }
  },

  // Get all available payment methods
  getPaymentMethods: async (amount?: number) => {
    try {
      const response = await api.get('/orders/payment/methods', { 
        params: { amount } 
      })
      return response.data
    } catch (error: any) {
      console.error('Get payment methods error:', error.response?.data || error.message)
      throw error
    }
  },

  // Create payment request
  createPaymentRequest: async (orderId: string, paymentMethod: string, paymentData?: any) => {
    try {
      const response = await api.post(`/orders/${orderId}/payment/request`, {
        paymentMethod,
        ...paymentData
      })
      return response.data
    } catch (error: any) {
      console.error('Create payment request error:', error.response?.data || error.message)
      throw error
    }
  },

  // Verify payment
  verifyPayment: async (orderId: string, verificationData: any) => {
    try {
      const response = await api.post(`/orders/${orderId}/payment/verify`, verificationData)
      return response.data
    } catch (error: any) {
      console.error('Verify payment error:', error.response?.data || error.message)
      throw error
    }
  },

  // Upload payment proof for bank transfer
  uploadPaymentProof: async (orderId: string, data: {
    transactionRef: string
    bankName: string
    transactionDate: string
    notes?: string
    proofImage: File
  }) => {
    try {
      const formData = new FormData()
      formData.append('proof', data.proofImage)
      formData.append('transactionRef', data.transactionRef)
      formData.append('bankName', data.bankName)
      formData.append('transactionDate', data.transactionDate)
      if (data.notes) formData.append('notes', data.notes)

      const response = await api.post(`/orders/${orderId}/payment/proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (error: any) {
      console.error('Upload payment proof error:', error.response?.data || error.message)
      throw error
    }
  },

  // Mark order as paid (for COD or manual payments)
  markAsPaid: async (orderId: string, data?: {
    paymentMethod?: string
    notes?: string
    transactionId?: string
  }) => {
    try {
      const response = await api.put(`/orders/${orderId}/pay`, data)
      return response.data
    } catch (error: any) {
      console.error('Mark as paid error:', error.response?.data || error.message)
      throw error
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason?: string) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, { reason })
      return response.data
    } catch (error: any) {
      console.error('Cancel order error:', error.response?.data || error.message)
      throw error
    }
  },

  // Get shipping methods for Pakistan
  getShippingMethods: async (city?: string, amount?: number) => {
    try {
      const response = await api.get('/orders/shipping-methods', {
        params: { city, amount }
      })
      return response.data
    } catch (error: any) {
      console.error('Get shipping methods error:', error.response?.data || error.message)
      throw error
    }
  },

  // Get user order statistics
  getUserOrderStats: async () => {
    try {
      const response = await api.get('/orders/stats/user')
      return response.data
    } catch (error: any) {
      console.error('Get user order stats error:', error.response?.data || error.message)
      throw error
    }
  },

  // Get invoice
  getInvoice: async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`)
      return response.data
    } catch (error: any) {
      console.error('Get invoice error:', error.response?.data || error.message)
      throw error
    }
  },

  // Request refund
  requestRefund: async (orderId: string, data: { reason: string }) => {
    try {
      const response = await api.post(`/orders/${orderId}/refund`, data)
      return response.data
    } catch (error: any) {
      console.error('Request refund error:', error.response?.data || error.message)
      throw error
    }
  },

  // ✅ FIXED: Get delivery slip data
  getDeliverySlip: async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/delivery-slip`);
      return response.data;
    } catch (error: any) {
      console.error('Get delivery slip error:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ FIXED: Download delivery slip as HTML
  downloadDeliverySlip: async (orderId: string, orderNumber: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/delivery-slip`);
      const slipData = response.data.data;
      
      // Generate HTML using imported function
      const html = generateDeliverySlipHTML(slipData);
      
      // Create download
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `delivery-slip-${orderNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: any) {
      console.error('Download delivery slip error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Download invoice as PDF
  downloadInvoicePDF: async (orderId: string, invoiceNumber: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice/pdf`, {
        responseType: 'blob'
      })
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      return { success: true }
    } catch (error: any) {
      console.error('Download invoice PDF error:', error.response?.data || error.message)
      throw error
    }
  }
}