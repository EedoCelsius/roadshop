import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import info from '../config/info.json'
import { useI18nStore } from './i18n'
import { usePaymentStore, type PaymentMethod } from './payment'

type PopupStateType = 'not-mobile' | 'not-installed'

type PopupState = {
  type: PopupStateType
  provider: DeepLinkProvider
}

type PaymentInfo = {
  toss?: {
    amount?: {
      krw?: number
    }
    bankName?: string
    accountNo?: string
  }
  kakao?: {
    amount?: {
      krw?: number
    }
    personalCode?: string
  }
}

type DeepLinkProvider = Exclude<PaymentMethod['deepLinkProvider'], undefined>

const paymentInfo = info as PaymentInfo

const isMobileDevice = () => {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as typeof window & { opera?: string }).opera || ''

  return /android|iphone|ipad|ipod|windows phone/i.test(userAgent)
}

const openUrlInNewTab = (url: string | null) => {
  if (!url || typeof window === 'undefined') {
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}

const toHexAmount = (value: number) => Math.round(value).toString(16).toUpperCase()

const createTossDeepLink = () => {
  const toss = paymentInfo.toss
  if (!toss?.amount?.krw || !toss.bankName || !toss.accountNo) {
    return null
  }

  const params = new URLSearchParams({
    amount: toss.amount.krw.toString(),
    bank: toss.bankName,
    accountNo: toss.accountNo,
  })

  return `supertoss://send?${params.toString()}`
}

const createKakaoDeepLink = () => {
  const kakao = paymentInfo.kakao
  const amount = kakao?.amount?.krw
  const personalCode = kakao?.personalCode

  if (!amount || !personalCode) {
    return null
  }

  const hexAmount = toHexAmount(amount * 8)

  return `kakaotalk://kakaopay/money/to/qr?qr_code=281006011${personalCode}${hexAmount}0000`
}

const resolveDeepLink = (provider: DeepLinkProvider) => {
  switch (provider) {
    case 'toss':
      return createTossDeepLink()
    case 'kakao':
      return createKakaoDeepLink()
    default:
      return null
  }
}

export const usePaymentActionsStore = defineStore('payment-actions', () => {
  const paymentStore = usePaymentStore()
  const { isCurrencySelectorOpen, selectedCurrency, selectedMethod } = storeToRefs(paymentStore)
  const i18nStore = useI18nStore()

  const popupState = ref<PopupState | null>(null)

  const isPopupVisible = computed(() => popupState.value !== null)

  const popupContent = computed(() => {
    if (!popupState.value) {
      return null
    }

    const { type, provider } = popupState.value

    return {
      title: i18nStore.t(`popups.deepLink.${type}.title`),
      message: i18nStore.t(`popups.deepLink.${type}.providers.${provider}.message`),
      confirmLabel: i18nStore.t(`popups.deepLink.${type}.confirm`),
    }
  })

  const closePopup = () => {
    popupState.value = null
  }

  const showPopup = (type: PopupStateType, provider: DeepLinkProvider) => {
    popupState.value = { type, provider }
  }

  const attemptDeepLinkLaunch = (provider: DeepLinkProvider, url: string | null) => {
    if (!url) {
      showPopup('not-installed', provider)
      return
    }

    if (typeof window === 'undefined' || typeof document === 'undefined') {
      showPopup('not-mobile', provider)
      return
    }

    let didLaunch = false

    const cleanup = () => {
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (fallbackTimer) {
        clearTimeout(fallbackTimer)
      }
    }

    const handleBlur = () => {
      didLaunch = true
      cleanup()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        didLaunch = true
        cleanup()
      }
    }

    const fallbackTimer = window.setTimeout(() => {
      cleanup()
      if (!didLaunch) {
        if (isMobileDevice()) {
          showPopup('not-installed', provider)
        } else {
          showPopup('not-mobile', provider)
        }
      }
    }, 1500)

    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    window.location.href = url
  }

  const handleMethodSelection = (methodId: string) => {
    const method = paymentStore.getMethodById(methodId)

    paymentStore.selectMethod(methodId)

    if (!method || method.status !== 'available') {
      return
    }

    if (isCurrencySelectorOpen.value) {
      return
    }

    if (method.deepLinkProvider) {
      const provider = method.deepLinkProvider
      attemptDeepLinkLaunch(provider, resolveDeepLink(provider))
      return
    }

    const url = paymentStore.getUrlForMethod(method.id, selectedCurrency.value ?? null)
    openUrlInNewTab(url)
  }

  const handleCurrencySelection = (currency: string) => {
    const method = selectedMethod.value

    if (!method) {
      return
    }

    paymentStore.chooseCurrency(currency)

    if (method.status !== 'available') {
      return
    }

    if (method.deepLinkProvider) {
      const provider = method.deepLinkProvider
      attemptDeepLinkLaunch(provider, resolveDeepLink(provider))
      return
    }

    const url = paymentStore.getUrlForMethod(method.id, currency)
    openUrlInNewTab(url)
  }

  return {
    isPopupVisible,
    popupContent,
    closePopup,
    handleMethodSelection,
    handleCurrencySelection,
  }
})
