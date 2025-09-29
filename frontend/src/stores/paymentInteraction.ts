import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { createPaymentActionResolver } from '@/actions/payment'
import { isMobileDevice } from '@/utils/device'
import { waitForDeepLinkLaunch } from '@/utils/deepLink'
import { openUrlInNewTab } from '@/utils/navigation'

import { useI18nStore } from './i18n'
import { usePaymentInfoStore } from './paymentInfo'
import { usePaymentStore, type DeepLinkProvider, type PaymentMethod } from './payment'

type PopupType = 'not-mobile' | 'not-installed'

type PopupState = {
  type: PopupType
  provider: DeepLinkProvider
}

export const usePaymentInteractionStore = defineStore('payment-interaction', () => {
  const paymentStore = usePaymentStore()
  const paymentInfoStore = usePaymentInfoStore()
  const i18nStore = useI18nStore()
  const { isCurrencySelectorOpen, selectedCurrency, selectedMethod } = storeToRefs(paymentStore)

  void paymentInfoStore.ensureLoaded()

  const popupState = ref<PopupState | null>(null)
  const isDeepLinkChecking = ref(false)
  const isTransferPopupVisible = ref(false)

  const transferAmount = computed(() => paymentInfoStore.transferInfo?.amount.krw ?? 0)
  const transferAccounts = computed(() => paymentInfoStore.transferInfo?.account ?? [])

  const isPopupVisible = computed(() => popupState.value !== null)

  const popupContent = computed(() => {
    if (!popupState.value) {
      return null
    }

    const { type, provider } = popupState.value
    const baseKey = 'popups.deepLink'

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

  const openTransferPopup = () => {
    isTransferPopupVisible.value = true
  }

  const closeTransferPopup = () => {
    isTransferPopupVisible.value = false
  }

  const openMethodUrl = (method: PaymentMethod, currency: string | null) => {
    const url = paymentStore.getUrlForMethod(method.id, currency ?? undefined)
    openUrlInNewTab(url)
  }

  const setDeepLinkChecking = (value: boolean) => {
    isDeepLinkChecking.value = value
  }

  const waitForDeepLinkResult = (timeoutMs?: number) => waitForDeepLinkLaunch(timeoutMs)

  const navigateToDeepLink = (url: string) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      openUrlInNewTab(url)
      return false
    }

    window.location.href = url
    return true
  }

  const resolveAction = createPaymentActionResolver({
    openTransferPopup,
    openMethodUrl,
    ensurePaymentInfoLoaded: paymentInfoStore.ensureLoaded,
    getDeepLinkInfo: paymentInfoStore.getDeepLinkInfo,
    showDeepLinkPopup: showPopup,
    setDeepLinkChecking,
    waitForDeepLinkResult,
    navigateToDeepLink,
    isMobileDevice,
    openUrlInNewTab,
  })

  const handleMethodSelection = async (methodId: string) => {
    const method = paymentStore.getMethodById(methodId)

    paymentStore.selectMethod(methodId)

    if (!method || method.status !== 'available') {
      return
    }

    if (isCurrencySelectorOpen.value) {
      return
    }

    const action = resolveAction(method)
    await action.handleSelection?.({ method, currency: selectedCurrency.value })
  }

  const handleCurrencySelection = async (currency: string) => {
    const method = selectedMethod.value

    if (!method) {
      return
    }

    paymentStore.chooseCurrency(currency)

    if (method.status !== 'available') {
      return
    }

    const action = resolveAction(method)
    await action.handleCurrencySelection?.({ method, currency })
  }

  return {
    isPopupVisible,
    popupContent,
    isDeepLinkChecking,
    isTransferPopupVisible,
    transferAmount,
    transferAccounts,
    closePopup,
    closeTransferPopup,
    handleMethodSelection,
    handleCurrencySelection,
  }
})
