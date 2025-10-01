import type { PaymentMethod, DeepLinkProvider } from '@/payments/types'
import type { KakaoPaymentInfo, TossPaymentInfo } from '@/payments/services/paymentInfoService'

export type DeepLinkPopupOptions = {
  deepLinkUrl?: string | null
}

export type PaymentActionContext = {
  openTransferDialog: () => void
  openMethodUrl: (method: PaymentMethod, currency: string | null) => void
  ensurePaymentInfoLoaded: () => Promise<boolean>
  getDeepLinkInfo: (provider: DeepLinkProvider) => TossPaymentInfo | KakaoPaymentInfo | null
  showDeepLinkPopup: (
    type: DeepLinkPopupType,
    provider: DeepLinkProvider,
    options?: DeepLinkPopupOptions,
  ) => void
  waitForDeepLinkResult: (timeoutMs?: number) => Promise<boolean>
  isMobileDevice: () => boolean
  openUrlInNewTab: (url: string | null) => void
  copyTossAccountInfo: () => Promise<boolean>
  showTossInstructionDialog: (seconds: number) => Promise<boolean>
  completeTossInstructionDialog: () => void
  setTossDeepLinkUrl: (url: string | null) => void
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
