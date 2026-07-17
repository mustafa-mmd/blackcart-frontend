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
  validateCoupon: async (code: string, orderAmount: number): Promise<CouponValidationResult> => {
    const response = await api.post('/coupons/validate', { code, orderAmount })
    return response.data.data
  },
}
