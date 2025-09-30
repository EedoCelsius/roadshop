export type DeepLinkProvider = 'toss' | 'kakao'

export type PaymentIcon = {
  src: string
  alt: string
}

export type PaymentMethod = {
  id: string
  category: 'KRW' | 'GLOBAL'
  url?: string
  icons?: PaymentIcon[]
  deepLinkProvider?: DeepLinkProvider
}

export type PaymentCategory = PaymentMethod['category']
