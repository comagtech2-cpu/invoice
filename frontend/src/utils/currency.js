import { DEFAULT_CURRENCY } from '../config/currency';

export const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'CA$',
  NGN: '₦',
  INR: '₹',
  CHF: 'Fr',
  CNY: '¥'
};

/**
 * Format a currency value with symbol
 * @param {number} amount - The monetary amount
 * @param {string} currency - The currency code (e.g., 'NGN', 'USD')
 * @returns {string} Formatted currency string (e.g., '₦1,234.50')
 */
export function formatCurrency(amount, currency) {
  const num = Number(amount);
  const formatted = isNaN(num) ? '0.00' : num.toFixed(2);
  
  // Use provided currency or fall back to default
  const code = String(currency || DEFAULT_CURRENCY).toUpperCase();
  const sym = currencySymbols[code];
  
  if (sym) return `${sym}${formatted}`;
  // Fallback to showing currency code
  return `${code} ${formatted}`;
}
