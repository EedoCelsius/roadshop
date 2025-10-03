export const formatKrwAmount = (amount: number, locale?: string | null): string =>
  amount
    .toLocaleString(locale || 'en', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    })
    .replace(/\u00A0/g, ' ')
