export type DeepLinkProvider = 'toss' | 'kakao'

export type PaymentMethodStatus = 'available' | 'coming-soon'

export type PaymentIcon = {
  src: string
  alt: string
}

export type PaymentMethod = {
  id: string
  name: string
  description: string
  currency: 'KRW' | 'GLOBAL'
  supportedCurrencies: string[]
  provider: string
  status: PaymentMethodStatus
  url?: string
  urlsByCurrency?: Record<string, string>
  icons?: PaymentIcon[]
  deepLinkProvider?: DeepLinkProvider
}

export type PaymentCurrency = PaymentMethod['currency']
