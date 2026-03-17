// src/hooks/useOrders.ts
import { useState, useCallback } from 'react'
import { orderService } from '../services/orderService'
import { Order, ShippingAddress } from '../types'
import toast from 'react-hot-toast'

export const useOrders = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = useCallback(async (orderData: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.createOrder(orderData)
      toast.success('Order created successfully!')
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create order'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getMyOrders = useCallback(async (params?: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.getMyOrders(params)
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch orders'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getOrderById = useCallback(async (orderId: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.getOrderById(orderId)
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch order'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const cancelOrder = useCallback(async (orderId: string, reason?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.cancelOrder(orderId, reason)
      toast.success('Order cancelled successfully')
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to cancel order'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getPaymentMethods = useCallback(async (amount?: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.getPaymentMethods(amount)
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch payment methods'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const createPaymentRequest = useCallback(async (orderId: string, paymentMethod: string, paymentData?: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.createPaymentRequest(orderId, paymentMethod, paymentData)
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create payment request'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadPaymentProof = useCallback(async (orderId: string, data: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.uploadPaymentProof(orderId, data)
      toast.success('Payment proof uploaded successfully')
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to upload payment proof'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getShippingMethods = useCallback(async (city?: string, amount?: number) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.getShippingMethods(city, amount)
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch shipping methods'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getUserOrderStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.getUserOrderStats()
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch order stats'
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsPaid = useCallback(async (orderId: string, data?: any) => {
    setLoading(true)
    setError(null)
    try {
      const response = await orderService.markAsPaid(orderId, data)
      toast.success('Order marked as paid')
      return response.data
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to mark order as paid'
      setError(errorMsg)
      toast.error(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    createOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    getPaymentMethods,
    createPaymentRequest,
    uploadPaymentProof,
    getShippingMethods,
    getUserOrderStats,
    markAsPaid,
  }
}