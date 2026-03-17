import { useState, useCallback } from 'react';
import { paymentService } from '../services/paymentService';
import { PaymentMethod, PaymentStatus } from '../types/payment.types';
import toast from 'react-hot-toast';

export const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

  // Load available payment methods
  const loadPaymentMethods = useCallback(async (amount: number, city?: string) => {
    setLoading(true);
    setError(null);
    try {
      const methods = await paymentService.getPaymentMethods(amount, city);
      setPaymentMethods(methods);
      return methods;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load payment methods';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create payment request
  const createPayment = useCallback(async (
    orderId: string,
    paymentMethod: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Generate idempotency key to prevent duplicate payments
      const idempotencyKey = paymentService.generateIdempotencyKey(orderId, paymentMethod);
      
      const result = await paymentService.createPaymentRequest(orderId, paymentMethod, idempotencyKey);
      
      toast.success('Payment request created successfully');
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to create payment';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Confirm payment
  const confirmPayment = useCallback(async (
    orderId: string,
    verificationData: any
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.confirmPayment(orderId, verificationData);
      toast.success('Payment confirmed successfully');
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Payment confirmation failed';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get payment status
  const getPaymentStatus = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const status = await paymentService.getPaymentStatus(orderId);
      setPaymentStatus(status);
      return status;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to get payment status';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload payment proof
  const uploadProof = useCallback(async (
    orderId: string,
    data: {
      transactionRef: string;
      bankName: string;
      transactionDate: string;
      notes?: string;
      proofImage: File;
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await paymentService.uploadPaymentProof(orderId, data);
      toast.success('Payment proof uploaded successfully');
      return result;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to upload payment proof';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll payment status (for real-time updates)
  const pollPaymentStatus = useCallback(async (
    orderId: string,
    onComplete?: (status: PaymentStatus) => void,
    interval = 3000,
    maxAttempts = 20
  ) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await paymentService.getPaymentStatus(orderId);
        
        if (status.isPaid || status.paymentStatus === 'failed') {
          onComplete?.(status);
          return true; // Stop polling
        }
        
        return false; // Continue polling
      } catch (error) {
        console.error('Polling error:', error);
        return false;
      }
    };

    const result = await poll();
    if (result) return;

    const intervalId = setInterval(async () => {
      attempts++;
      const shouldStop = await poll();
      
      if (shouldStop || attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, []);

  // Validate payment method
  const validateMethod = useCallback((method: PaymentMethod, amount: number) => {
    return paymentService.validateAmount(amount, method);
  }, []);

  // Format amount
  const formatAmount = useCallback((amount: number) => {
    return paymentService.formatAmount(amount);
  }, []);

  // Get method icon
  const getMethodIcon = useCallback((methodId: string) => {
    return paymentService.getMethodIcon(methodId);
  }, []);

  // Get method color
  const getMethodColor = useCallback((methodId: string) => {
    return paymentService.getMethodColor(methodId);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
    setPaymentStatus(null);
  }, []);

  return {
    loading,
    error,
    paymentMethods,
    paymentStatus,
    loadPaymentMethods,
    createPayment,
    confirmPayment,
    getPaymentStatus,
    uploadProof,
    pollPaymentStatus,
    validateMethod,
    formatAmount,
    getMethodIcon,
    getMethodColor,
    reset
  };
};