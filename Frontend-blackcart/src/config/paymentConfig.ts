// src/config/paymentConfig.ts

// Bank Details - Using import.meta.env for Vite
export const BANK_DETAILS = {
  bankName: import.meta.env.VITE_BANK_NAME || 'Habib Bank Limited (HBL)',
  accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || 'BlackCart.store',
  accountNumber: import.meta.env.VITE_BANK_ACCOUNT_NUMBER || '1234567890123456',
  iban: import.meta.env.VITE_BANK_IBAN || 'PK00HABB1234567890123456',
  branchCode: import.meta.env.VITE_BANK_BRANCH_CODE || '1234',
  branchName: import.meta.env.VITE_BANK_BRANCH_NAME || 'Islamia Town, Peshawar',
  swiftCode: import.meta.env.VITE_BANK_SWIFT_CODE || 'HABBPKKA'
}

// COD Rules
export const COD_RULES = {
  minAmount: Number(import.meta.env.VITE_COD_MIN_AMOUNT) || 0,
  maxAmount: Number(import.meta.env.VITE_COD_MAX_AMOUNT) || 50000,
  chargeThreshold: Number(import.meta.env.VITE_COD_CHARGE_THRESHOLD) || 5000,
  chargeAmount: Number(import.meta.env.VITE_COD_CHARGE_AMOUNT) || 200
}

// Payment Gateway IDs
export const PAYMENT_IDS = {
  easypaisa: {
    storeId: import.meta.env.VITE_EASYPAISA_STORE_ID || 'EP_STORE_123456',
    merchantId: import.meta.env.VITE_EASYPAISA_MERCHANT_ID || 'EP_MERCHANT_123456'
  },
  jazzcash: {
    merchantId: import.meta.env.VITE_JAZZCASH_MERCHANT_ID || 'JC_MERCHANT_123456'
  }
}

// Support
export const SUPPORT = {
  email: import.meta.env.VITE_SUPPORT_EMAIL || 'blackcart.ak25@gmail.com',
  phone: import.meta.env.VITE_SUPPORT_PHONE || '+92 3146965599'
}
