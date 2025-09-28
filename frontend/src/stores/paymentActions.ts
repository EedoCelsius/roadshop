import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import info from '../config/info.json'
import { useI18nStore } from './i18n'
import { usePaymentStore, type PaymentMethod } from './payment'

type PopupType = 'not-mobile' | 'not-installed'

type PopupState = {
  type: PopupType
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
      throw new Error(`Unknown provider: ${provider}`);
  }
}

export const usePaymentActionsStore = defineStore('payment-actions', () => {
  const paymentStore = usePaymentStore()
  const { isCurrencySelectorOpen, selectedCurrency, selectedMethod } = storeToRefs(paymentStore)
  const i18nStore = useI18nStore()

  const popupState = ref<PopupState | null>(null)
  const isDeepLinkChecking = ref(false)

  const isPopupVisible = computed(() => popupState.value !== null)

  const popupContent = computed(() => {
    if (!popupState.value) {
      return null
    }

    const { type, provider } = popupState.value
    const baseKey = `popups.deepLink`

    if (type === 'not-mobile') {
      return {
        title: i18nStore.t(`${baseKey}.titles.notMobile`),
        message: i18nStore.t(`${baseKey}.providers.${provider}.notMobile`),
        confirmLabel: i18nStore.t(`${baseKey}.confirms.notMobile`),
      }
    }

    return {
      title: i18nStore.t(`${baseKey}.titles.notInstalled`),
      message: i18nStore.t(`${baseKey}.providers.${provider}.notInstalled`),
      confirmLabel: i18nStore.t(`${baseKey}.confirms.notInstalled`),
    }
  })

  const closePopup = () => {
    popupState.value = null
  }

  const showPopup = (type: PopupType, provider: DeepLinkProvider) => {
    popupState.value = { type, provider }
  }

  const attemptDeepLinkLaunch = (provider: DeepLinkProvider) => {
    const url = resolveDeepLink(provider)
    
    if (!isMobileDevice()) {
      showPopup('not-mobile', provider)
    }

    let didLaunch = false
    isDeepLinkChecking.value = true

    const handleBlur = () => {
      didLaunch = true
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        didLaunch = true
      }
    }

    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    window.setTimeout(() => {
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      isDeepLinkChecking.value = false
      
      if (!didLaunch && isMobileDevice()) {
        showPopup('not-installed', provider)
      }
    }, 1500)

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
      attemptDeepLinkLaunch(method.deepLinkProvider)
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
      attemptDeepLinkLaunch(method.deepLinkProvider)
      return
    }

    const url = paymentStore.getUrlForMethod(method.id, currency)
    openUrlInNewTab(url)
  }

  return {
    isPopupVisible,
    popupContent,
    isDeepLinkChecking,
    closePopup,
    handleMethodSelection,
    handleCurrencySelection,
  }
})
