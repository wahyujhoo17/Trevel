const EXCHANGE_RATES = {
  EUR: {
    USD: 1.09,
    IDR: 18450,
  },
  USD: {
    EUR: 0.92,
    IDR: 16900,
  },
  IDR: {
    EUR: 0.000054,
    USD: 0.000059,
  },
};

export const convertCurrency = (
  amount: number,
  from: string,
  to: string
): number => {
  if (from === to) return amount;
  return amount * EXCHANGE_RATES[from][to];
};

export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};