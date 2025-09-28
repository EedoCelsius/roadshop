import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import info from '../config/info.json'
import { useI18nStore } from './i18n'
import { usePaymentStore, type PaymentMethod } from './payment'

type PopupType = 'not-mobile' | 'not-installed'

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

  const popupType = ref<PopupType | null>(null)

  const isPopupVisible = computed(() => popupType.value !== null)

  const popupContent = computed(() => {
    if (!popupType.value) {
      return null
    }

    if (popupType.value === 'not-mobile') {
      return {
        title: i18nStore.t('popups.deepLink.notMobile.title'),
        message: i18nStore.t('popups.deepLink.notMobile.message'),
        confirmLabel: i18nStore.t('popups.deepLink.notMobile.confirm'),
      }
    }

    return {
      title: i18nStore.t('popups.deepLink.notInstalled.title'),
      message: i18nStore.t('popups.deepLink.notInstalled.message'),
      confirmLabel: i18nStore.t('popups.deepLink.notInstalled.confirm'),
    }
  })

  const closePopup = () => {
    popupType.value = null
  }

  const showPopup = (type: PopupType) => {
    popupType.value = type
  }

  const attemptDeepLinkLaunch = (url: string | null) => {
    if (!url) {
      showPopup('not-installed')
      return
    }

    if (!isMobileDevice() || typeof window === 'undefined' || typeof document === 'undefined') {
      showPopup('not-mobile')
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
        showPopup('not-installed')
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
      attemptDeepLinkLaunch(resolveDeepLink(method.deepLinkProvider))
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
      attemptDeepLinkLaunch(resolveDeepLink(method.deepLinkProvider))
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
