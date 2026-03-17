// src/utils/formatPrice.ts

/**
 * Format a number as PKR currency
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted price string
 */
export const formatPrice = (
  amount: number | string | undefined | null,
  options?: {
    currency?: string;
    showSymbol?: boolean;
    decimals?: number;
  }
): string => {
  // Handle undefined, null, or invalid values
  if (amount === undefined || amount === null) {
    return options?.showSymbol === false ? '0' : 'PKR 0';
  }

  // Convert to number
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  // Check if valid number
  if (isNaN(numAmount)) {
    return options?.showSymbol === false ? '0' : 'PKR 0';
  }

  const {
    currency = 'PKR',
    showSymbol = true,
    decimals = 0
  } = options || {};

  // Format the number
  const formatted = new Intl.NumberFormat('en-PK', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: showSymbol ? currency : undefined,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numAmount);

  // If showing symbol, return as is
  if (showSymbol) {
    return formatted;
  }

  // Otherwise, just return the number with commas
  return formatted;
};

/**
 * Format price for display in different contexts
 */
export const formatPriceShort = (amount: number): string => {
  if (amount >= 10000000) { // 1 Crore+
    return `PKR ${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) { // 1 Lakh+
    return `PKR ${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) { // 1 Thousand+
    return `PKR ${(amount / 1000).toFixed(1)}K`;
  }
  return formatPrice(amount);
};

/**
 * Calculate discount percentage
 */
export const calculateDiscount = (original: number, discounted: number): number => {
  if (original <= 0 || discounted <= 0) return 0;
  return Math.round(((original - discounted) / original) * 100);
};

/**
 * Format discount percentage
 */
export const formatDiscount = (original: number, discounted: number): string => {
  const discount = calculateDiscount(original, discounted);
  return discount > 0 ? `${discount}% OFF` : '';
};

export default formatPrice;