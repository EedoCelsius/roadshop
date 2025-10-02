export type DeepLinkProvider = 'toss' | 'kakao'

export type PaymentIcon = {
  src: string
  alt: string
}

export type PaymentMethod = {
  id: string
  icons?: PaymentIcon[]
  deepLinkProvider?: DeepLinkProvider
}

export type PaymentMethodWithCurrencies = PaymentMethod & {
  supportedCurrencies: string[]
}

export type PaymentCategory = 'KRW' | 'GLOBAL'
