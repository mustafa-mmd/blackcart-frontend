// src/services/realPaymentService.ts
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export interface PaymentRequest {
  orderId: string
  paymentMethod: string
  amount: number
  customerName: string
  customerEmail: string
  customerPhone: string
}

export interface PaymentResponse {
  success: boolean
  data?: {
    paymentMethod: string
    paymentUrl?: string
    qrCode?: string
    transactionId: string
    amount: number
    formData?: Record<string, any>
    bankDetails?: {
      bankName: string
      accountName: string
      accountNumber: string
      iban: string
      swiftCode: string
    }
    instructions: string[]
    expiresAt: string
  }
  error?: string
}

class RealPaymentService {
  // Create payment request - REAL INTEGRATION
  async createPayment(data: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(`${API_URL}/payments/create/${data.orderId}`, {
        paymentMethod: data.paymentMethod
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error: any) {
      console.error('Payment creation error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Payment failed'
      }
    }
  }

  // Confirm payment after gateway redirect
  async confirmPayment(orderId: string, data: any): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/payments/confirm/${orderId}`, data, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Payment confirmation error:', error)
      throw error
    }
  }

  // Get payment status
  async getPaymentStatus(orderId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/payments/status/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Payment status error:', error)
      throw error
    }
  }

  // Upload payment proof for bank transfer
  async uploadPaymentProof(orderId: string, formData: FormData): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/payments/${orderId}/proof`, formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error: any) {
      console.error('Proof upload error:', error)
      throw error
    }
  }

  // Submit JazzCash form (handles form submission)
  submitJazzCashForm(paymentData: any) {
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = paymentData.paymentUrl
    form.target = '_blank'

    // Add all form fields
    Object.entries(paymentData.formData).forEach(([key, value]) => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = value as string
      form.appendChild(input)
    })

    document.body.appendChild(form)
    form.submit()
    document.body.removeChild(form)
  }
}

export const realPaymentService = new RealPaymentService()