import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useI18nStore } from '@/localization/store'
import { waitForDeepLinkLaunch } from '@/payments/services/deepLinkService'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'
import { usePaymentStore } from '@/payments/stores/payment.store'
import type { DeepLinkProvider, PaymentMethod } from '@/payments/types'
import { createPaymentActionResolver } from '@/payments/workflows/createPaymentActionResolver'
import type { PaymentActionContext } from '@/payments/workflows/types'
import { isMobileDevice } from '@/shared/utils/device'
import { openUrlInNewTab } from '@/shared/utils/navigation'

type PopupType = 'not-mobile' | 'not-installed'

type PopupState = {
  type: PopupType
  provider: DeepLinkProvider
}

const buildWorkflowContext = (
  paymentStore: ReturnType<typeof usePaymentStore>,
  paymentInfoStore: ReturnType<typeof usePaymentInfoStore>,
  showPopup: (state: PopupState) => void,
  setDeepLinkChecking: (value: boolean) => void,
  openTransferDialog: () => void,
): PaymentActionContext => ({
  openTransferDialog,
  openMethodUrl: (method: PaymentMethod, currency: string | null) => {
    const url = paymentStore.getUrlForMethod(method.id, currency ?? undefined)
    openUrlInNewTab(url)
  },
  ensurePaymentInfoLoaded: paymentInfoStore.ensureLoaded,
  getDeepLinkInfo: paymentInfoStore.getDeepLinkInfo,
  showDeepLinkPopup: (type, provider) => {
    showPopup({ type, provider })
  },
  setDeepLinkChecking,
  waitForDeepLinkResult: waitForDeepLinkLaunch,
  navigateToDeepLink: (url: string) => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      openUrlInNewTab(url)
      return false
    }

    window.location.href = url
    return true
  },
  isMobileDevice,
  openUrlInNewTab,
})

export const usePaymentInteractionStore = defineStore('payment-interaction', () => {
  const paymentStore = usePaymentStore()
  const paymentInfoStore = usePaymentInfoStore()
  const i18nStore = useI18nStore()
  const { isCurrencySelectorOpen, selectedCurrency, selectedMethod } = storeToRefs(paymentStore)

  void paymentInfoStore.ensureLoaded()

  const popupState = ref<PopupState | null>(null)
  const isDeepLinkChecking = ref(false)
  const isTransferDialogVisible = ref(false)

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

  const showPopup = (state: PopupState) => {
    popupState.value = state
  }

  const openTransferDialog = () => {
    isTransferDialogVisible.value = true
  }

  const closeTransferDialog = () => {
    isTransferDialogVisible.value = false
  }

  const setDeepLinkChecking = (value: boolean) => {
    isDeepLinkChecking.value = value
  }

  const workflowContext = buildWorkflowContext(
    paymentStore,
    paymentInfoStore,
    showPopup,
    setDeepLinkChecking,
    openTransferDialog,
  )

  const resolveAction = createPaymentActionResolver(workflowContext)

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
    isTransferDialogVisible,
    transferAmount,
    transferAccounts,
    closePopup,
    closeTransferDialog,
    handleMethodSelection,
    handleCurrencySelection,
  }
})
