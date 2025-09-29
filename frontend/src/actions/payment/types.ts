import type { PaymentMethod, DeepLinkProvider } from '@/stores/payment'
import type { KakaoPaymentInfo, TossPaymentInfo } from '@/stores/paymentInfo'

export type PaymentActionContext = {
  openTransferPopup: () => void
  openMethodUrl: (method: PaymentMethod, currency: string | null) => void
  ensurePaymentInfoLoaded: () => Promise<boolean>
  getDeepLinkInfo: (provider: DeepLinkProvider) => TossPaymentInfo | KakaoPaymentInfo | null
  showDeepLinkPopup: (type: DeepLinkPopupType, provider: DeepLinkProvider) => void
  setDeepLinkChecking: (value: boolean) => void
  waitForDeepLinkResult: (timeoutMs?: number) => Promise<boolean>
  navigateToDeepLink: (url: string) => boolean
  isMobileDevice: () => boolean
  openUrlInNewTab: (url: string | null) => void
}

export type PaymentMethodAction = {
  handleSelection?: (payload: PaymentSelectionPayload) => Promise<void> | void
  handleCurrencySelection?: (payload: PaymentCurrencySelectionPayload) => Promise<void> | void
}

export type PaymentSelectionPayload = {
  method: PaymentMethod
  currency: string | null
}

export type PaymentCurrencySelectionPayload = {
  method: PaymentMethod
  currency: string
}

export type DeepLinkPopupType = 'not-mobile' | 'not-installed'
