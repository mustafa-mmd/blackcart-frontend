import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../services/orderService';

type PaymentProofData = {
  transactionRef: string;
  bankName: string;
  transactionDate: string;
  notes?: string;
  proofImage: File;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getOrderById = useCallback(async (orderId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getOrderById(orderId);
      return response.data;
    } catch (caught) {
      setError(getErrorMessage(caught, 'Failed to fetch order'));
      throw caught;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentMethods = useCallback(async (amount?: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.getPaymentMethods(amount);
      return response.data;
    } catch (caught) {
      setError(getErrorMessage(caught, 'Failed to fetch payment methods'));
      throw caught;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPaymentRequest = useCallback(async (
    orderId: string,
    paymentMethod: string,
    paymentData?: Record<string, unknown>,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.createPaymentRequest(orderId, paymentMethod, paymentData);
      return response.data;
    } catch (caught) {
      const message = getErrorMessage(caught, 'Failed to create payment request');
      setError(message);
      toast.error(message);
      throw caught;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadPaymentProof = useCallback(async (orderId: string, data: PaymentProofData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.uploadPaymentProof(orderId, data);
      toast.success('Payment proof uploaded successfully');
      return response.data;
    } catch (caught) {
      const message = getErrorMessage(caught, 'Failed to upload payment proof');
      setError(message);
      toast.error(message);
      throw caught;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, getOrderById, getPaymentMethods, createPaymentRequest, uploadPaymentProof };
};
