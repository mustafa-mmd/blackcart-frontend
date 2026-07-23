import api from './api'

export interface ValidatedCoupon {
  _id: string
  code: string
  discountType: 'percentage' | 'fixed'
  discountValue: number
  minOrderAmount: number
  maxDiscountAmount: number | null
  validUntil: string
}

export interface CouponValidationResult {
  coupon: ValidatedCoupon
  discountAmount: number
  finalAmount: number
}

export const couponService = {
  getAvailability: async (): Promise<{ enabled: boolean; availableCount: number }> => {
    const response = await api.get('/coupons/availability')
    return response.data.data
  },

  validateCoupon: async (code: string, orderAmount: number): Promise<CouponValidationResult> => {
    const response = await api.post('/coupons/validate', { code, orderAmount })
    return response.data.data
  },
}



