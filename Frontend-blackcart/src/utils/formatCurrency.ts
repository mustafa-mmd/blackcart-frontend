// src/utils/formatCurrency.ts
export const formatCurrency = (amount: number, currency: string = 'PKR'): string => {
  if (isNaN(amount)) return `${currency} 0`
  
  const formatter = new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount).replace('PKR', currency)
}

export const formatPrice = (price: number): string => {
  return `PKR ${price.toLocaleString('en-PK')}`
}

export const formatDiscount = (originalPrice: number, discountPrice: number): string => {
  const discount = ((originalPrice - discountPrice) / originalPrice) * 100
  return `${Math.round(discount)}% OFF`
}

export const calculateSavings = (originalPrice: number, discountPrice: number): number => {
  return originalPrice - discountPrice
}

export const formatSavings = (originalPrice: number, discountPrice: number): string => {
  const savings = calculateSavings(originalPrice, discountPrice)
  return `Save ${formatPrice(savings)}`
}

export const calculateTax = (amount: number, taxRate: number = 0.16): number => {
  return amount * taxRate
}

export const formatTax = (amount: number, taxRate: number = 0.16): string => {
  return formatCurrency(calculateTax(amount, taxRate))
}

export const calculateTotalWithTax = (amount: number, taxRate: number = 0.16): number => {
  return amount + calculateTax(amount, taxRate)
}

export const formatTotalWithTax = (amount: number, taxRate: number = 0.16): string => {
  return formatCurrency(calculateTotalWithTax(amount, taxRate))
}

export const parseCurrency = (currencyString: string): number => {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''))
}