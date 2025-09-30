export type DeepLinkProvider = 'toss' | 'kakao'

export type PaymentIcon = {
  src: string
  alt: string
}

export type PaymentMethod = {
  id: string
  currency: 'KRW' | 'GLOBAL'
  url?: string
  icons?: PaymentIcon[]
  deepLinkProvider?: DeepLinkProvider
}

export type PaymentCurrency = PaymentMethod['currency']
