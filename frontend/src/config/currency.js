/**
 * Global Currency Configuration for Invoice SaaS
 * Default Currency: Nigerian Naira (NGN)
 */

export const DEFAULT_CURRENCY = 'NGN';
export const CURRENCY_SYMBOL = '₦';

export const SUPPORTED_CURRENCIES = [
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
];

export const APP_SETTINGS = {
  currency: DEFAULT_CURRENCY,
  currencySymbol: CURRENCY_SYMBOL,
  timezone: 'Africa/Lagos',
  locale: 'en-NG',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '24h',
};
