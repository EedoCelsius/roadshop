import type { PaymentMethod, DeepLinkProvider } from '@/payments/types'
import type { KakaoPaymentInfo, TossPaymentInfo } from '@/payments/services/paymentInfoService'

export type PaymentActionContext = {
  openTransferDialog: () => void
  openMethodUrl: (method: PaymentMethod, currency: string | null) => void
  ensurePaymentInfoLoaded: () => Promise<boolean>
  getDeepLinkInfo: (provider: DeepLinkProvider) => TossPaymentInfo | KakaoPaymentInfo | null
  showDeepLinkPopup: (type: DeepLinkPopupType, provider: DeepLinkProvider) => void
  setDeepLinkChecking: (value: boolean) => void
  waitForDeepLinkResult: (timeoutMs?: number) => Promise<boolean>
  navigateToDeepLink: (url: string) => boolean
  isMobileDevice: () => boolean
  openUrlInNewTab: (url: string | null) => void
  copyTossAccountInfo: () => Promise<boolean>
  setTossDeepLinkUrl: (url: string | null) => void
  showTossInstructionDialog: (seconds: number) => Promise<void>
  completeTossInstructionDialog: () => void
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
