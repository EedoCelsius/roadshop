import type { Locale } from '@/stores/i18n'
import type { PaymentCurrency } from '@/stores/payment'

export type PaymentLayoutConfig = {
  sectionOrder: PaymentCurrency[]
  methodOrder?: Partial<Record<PaymentCurrency, string[]>>
}

const DEFAULT_CONFIG: PaymentLayoutConfig = {
  sectionOrder: ['GLOBAL', 'KRW'],
  methodOrder: {
    GLOBAL: ['credit-card', 'alipay', 'paypal'],
  },
}

const LOCALE_CONFIGS: Partial<Record<Locale, PaymentLayoutConfig>> = {
  ko: {
    sectionOrder: ['KRW', 'GLOBAL'],
  },
  en: {
    sectionOrder: ['GLOBAL', 'KRW'],
    methodOrder: {
      GLOBAL: ['credit-card', 'paypal', 'alipay'],
    },
  },
  zh: {
    sectionOrder: ['GLOBAL', 'KRW'],
    methodOrder: {
      GLOBAL: ['alipay', 'credit-card', 'paypal'],
    },
  },
}

export const getPaymentLayoutConfig = (locale: Locale): PaymentLayoutConfig => {
  const localeConfig = LOCALE_CONFIGS[locale]

  if (!localeConfig) {
    return DEFAULT_CONFIG
  }

  const mergedMethodOrder = {
    ...(DEFAULT_CONFIG.methodOrder ?? {}),
    ...(localeConfig.methodOrder ?? {}),
  }

  return {
    sectionOrder: localeConfig.sectionOrder ?? DEFAULT_CONFIG.sectionOrder,
    methodOrder: Object.keys(mergedMethodOrder).length ? mergedMethodOrder : undefined,
  }
}
