// src/data/paymentMethods.ts
import { BANK_DETAILS, COD_RULES, PAYMENT_IDS, SUPPORT } from '../config/paymentConfig'

export interface PaymentMethod {
  id: string
  name: string
  type: string
  description: string
  icon: string
  processingTime: string
  minAmount: number
  maxAmount: number
  charges?: number
  enabled: boolean
  instructions?: string[]
  logo?: string
  fee?: string
  bankDetails?: typeof BANK_DETAILS
  merchantId?: string
  storeId?: string
}

export const getPaymentMethods = (orderTotal: number): PaymentMethod[] => {
  return [
    // Cash on Delivery
    {
      id: 'cod',
      name: 'Cash on Delivery',
      type: 'cash',
      description: 'Pay when you receive your order - Available nationwide',
      icon: '💰',
      processingTime: 'On Delivery',
      minAmount: COD_RULES.minAmount,
      maxAmount: COD_RULES.maxAmount,
      charges: orderTotal < COD_RULES.chargeThreshold ? COD_RULES.chargeAmount : 0,
      enabled: true,
      fee: orderTotal < COD_RULES.chargeThreshold ? `PKR ${COD_RULES.chargeAmount}` : 'Free',
      instructions: [
        'Pay cash when your order is delivered',
        'Have exact change ready',
        'Delivery agent will provide official receipt',
        `Maximum order value: PKR ${COD_RULES.maxAmount.toLocaleString()}`,
        orderTotal < COD_RULES.chargeThreshold ? `COD Charges: PKR ${COD_RULES.chargeAmount} apply` : 'No COD charges apply',
        'Available in all major cities of Pakistan'
      ]
    },
    
    // EasyPaisa
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      type: 'digital_wallet',
      description: 'Pay via EasyPaisa mobile account - Pakistan\'s leading mobile wallet',
      icon: '📱',
      processingTime: 'Instant',
      minAmount: 100,
      maxAmount: 500000,
      charges: 0,
      enabled: true,
      fee: '0%',
      storeId: PAYMENT_IDS.easypaisa.storeId,
      merchantId: PAYMENT_IDS.easypaisa.merchantId,
      instructions: [
        'Open EasyPaisa app on your mobile',
        'Select "Pay" or "Scan QR" option',
        `Enter amount: PKR ${orderTotal.toLocaleString()}`,
        `Scan QR code or enter merchant ID: ${PAYMENT_IDS.easypaisa.merchantId}`,
        'Confirm payment with your PIN',
        'Transaction will be processed instantly',
        'Save transaction ID for reference'
      ]
    },
    
    // JazzCash
    {
      id: 'jazzcash',
      name: 'JazzCash',
      type: 'digital_wallet',
      description: 'Pay via JazzCash mobile account - Fast and secure payments',
      icon: '💳',
      processingTime: 'Instant',
      minAmount: 100,
      maxAmount: 500000,
      charges: 0,
      enabled: true,
      fee: '0%',
      merchantId: PAYMENT_IDS.jazzcash.merchantId,
      instructions: [
        'Open JazzCash app',
        'Select "Send Money" or "Pay Merchant"',
        `Enter amount: PKR ${orderTotal.toLocaleString()}`,
        `Enter Merchant ID: ${PAYMENT_IDS.jazzcash.merchantId}`,
        'Confirm payment with your PIN',
        'Transaction will be processed instantly',
        'Save transaction ID for reference'
      ]
    },
    
    // SadaPay
    {
      id: 'sadapay',
      name: 'SadaPay',
      type: 'digital_wallet',
      description: 'Pay via SadaPay mobile wallet - The modern way to pay',
      icon: '💳',
      processingTime: 'Instant',
      minAmount: 100,
      maxAmount: 500000,
      charges: 0,
      enabled: true,
      fee: '0%',
      instructions: [
        'Open SadaPay app',
        'Select "Pay" option',
        `Enter amount: PKR ${orderTotal.toLocaleString()}`,
        'Scan QR code shown on next screen',
        'Authorize payment with fingerprint/PIN',
        'Instant payment confirmation'
      ]
    },
    
    // NayaPay
    {
      id: 'nayapay',
      name: 'NayaPay',
      type: 'digital_wallet',
      description: 'Pay via NayaPay mobile wallet - Smart payment solution',
      icon: '💳',
      processingTime: 'Instant',
      minAmount: 100,
      maxAmount: 500000,
      charges: 0,
      enabled: true,
      fee: '0%',
      instructions: [
        'Open NayaPay app',
        'Select "Pay" option',
        `Enter amount: PKR ${orderTotal.toLocaleString()}`,
        'Scan QR code or enter payment link',
        'Confirm payment details',
        'Authorize payment',
        'Instant confirmation'
      ]
    },
    
    // Bank Transfer
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      type: 'manual',
      description: 'Direct bank transfer via IBAN - HBL Bank',
      icon: '🏦',
      processingTime: '24 hours',
      minAmount: 1000,
      maxAmount: 10000000,
      charges: 0,
      enabled: true,
      bankDetails: BANK_DETAILS,
      instructions: [
        'Copy our bank account details below',
        `Transfer exact amount: PKR ${orderTotal.toLocaleString()}`,
        'Use transaction reference in description',
        'Save payment receipt/screenshot',
        'Upload proof after order placement',
        'Verification takes 24-48 hours'
      ]
    },
    
    // Card Payments
    {
      id: 'card',
      name: 'Credit/Debit Card',
      type: 'card',
      description: 'Pay via Visa/MasterCard/American Express - Secure online payment',
      icon: '💳',
      processingTime: 'Instant',
      minAmount: 100,
      maxAmount: 2000000,
      charges: 0,
      enabled: true,
      fee: '2% processing fee',
      instructions: [
        'Enter your card details securely',
        'Card will be charged immediately',
        'OTP may be required for verification',
        'Payment confirmation will be instant',
        'Works with Visa, MasterCard, American Express'
      ]
    }
  ]
}

export const SUPPORT_INFO = SUPPORT