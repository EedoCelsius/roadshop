export type PaymentIcon = {
  src: string
  alt: string
}

export type PaymentMethod = {
  id: string
  icons?: PaymentIcon[]
}

export type PaymentMethodWithCurrencies = PaymentMethod & {
  supportedCurrencies: string[]
}

export type PaymentCategory = 'KRW' | 'GLOBAL'
