import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useI18nStore } from '@/localization/store'
import { launchDeepLink, waitForDeepLinkLaunch } from '@/payments/services/deepLinkService'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { createCountdownManager } from '@/payments/stores/utils/createCountdownManager'
import type { DeepLinkProvider, PaymentMethod } from '@/payments/types'
import { createPaymentActionResolver } from '@/payments/workflows/createPaymentActionResolver'
import type {
  DeepLinkPopupOptions,
  DeepLinkPopupType,
  PaymentActionContext,
} from '@/payments/workflows/types'
import { isMobileDevice } from '@/shared/utils/device'
import { openUrlInNewTab } from '@/shared/utils/navigation'
import { copyText } from '@/shared/utils/clipboard'

const buildWorkflowContext = (
  paymentStore: ReturnType<typeof usePaymentStore>,
  paymentInfoStore: ReturnType<typeof usePaymentInfoStore>,
  showPopup: (
    type: DeepLinkPopupType,
    provider: DeepLinkProvider,
    options?: DeepLinkPopupOptions,
  ) => void,
  setDeepLinkChecking: (value: boolean) => void,
  openTransferDialog: () => void,
  copyTossAccountInfo: () => Promise<boolean>,
  showTossInstructionDialog: (seconds: number) => Promise<boolean>,
  completeTossInstructionDialog: () => void,
  setTossDeepLinkUrl: (url: string | null) => void,
): PaymentActionContext => ({
  openTransferDialog,
  openMethodUrl: (method: PaymentMethod, currency: string | null) => {
    const url = paymentInfoStore.getMethodUrl(method.id, currency ?? undefined)
    openUrlInNewTab(url)
  },
  ensurePaymentInfoLoaded: paymentInfoStore.ensureLoaded,
  getDeepLinkInfo: paymentInfoStore.getDeepLinkInfo,
  showDeepLinkPopup: showPopup,
  setDeepLinkChecking,
  waitForDeepLinkResult: waitForDeepLinkLaunch,
  isMobileDevice,
  openUrlInNewTab,
  copyTossAccountInfo,
  showTossInstructionDialog,
  completeTossInstructionDialog,
  setTossDeepLinkUrl,
})

export const usePaymentInteractionStore = defineStore('payment-interaction', () => {
  const paymentStore = usePaymentStore()
  const paymentInfoStore = usePaymentInfoStore()
  const i18nStore = useI18nStore()
  const { isCurrencySelectorOpen, selectedCurrency, selectedMethod } = storeToRefs(paymentStore)
  const { tossInfo } = storeToRefs(paymentInfoStore)

  void paymentInfoStore.ensureLoaded()

  const popupContent = ref<{
    type: DeepLinkPopupType
    provider: DeepLinkProvider
    title: string
    message: string
    confirmLabel: string
    deepLinkUrl: string | null
  } | null>(null)
  const isDeepLinkChecking = ref(false)
  const isTransferDialogVisible = ref(false)
  const isTossInstructionDialogVisible = ref(false)
  const tossInstructionCountdown = ref(0)
  const hasCopiedTossAccountInfo = ref(false)
  const tossDeepLinkUrl = ref<string | null>(null)

  const tossCountdownManager = createCountdownManager((remainingSeconds) => {
    tossInstructionCountdown.value = remainingSeconds
  })

  const transferAmount = computed(() => paymentInfoStore.transferInfo?.amount.krw ?? 0)
  const transferAccounts = computed(() => paymentInfoStore.transferInfo?.account ?? [])

  const isPopupVisible = computed(() => popupContent.value !== null)

  const closePopup = () => {
    popupContent.value = null
  }

  const showPopup = (
    type: DeepLinkPopupType,
    provider: DeepLinkProvider,
    options: DeepLinkPopupOptions = {},
  ) => {
    const baseKey = 'popups.deepLink'
    const keySuffix = type === 'not-mobile' ? 'notMobile' : 'notInstalled'

    popupContent.value = {
      type,
      provider,
      title: i18nStore.t(`${baseKey}.titles.${keySuffix}`),
      message: i18nStore.t(`${baseKey}.providers.${provider}.${keySuffix}`),
      confirmLabel: i18nStore.t(`${baseKey}.confirms.${keySuffix}`),
      deepLinkUrl: options.deepLinkUrl ?? null,
    }
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

  const copyTossAccountInfo = async (): Promise<boolean> => {
    if (!tossInfo.value) {
      return false
    }

    const amountText = new Intl.NumberFormat('ko-KR').format(tossInfo.value.amount.krw)
    const payload = `${tossInfo.value.bankName} ${tossInfo.value.accountNo} ${tossInfo.value.accountHolder} [${amountText}원]`
    const success = await copyText(payload)

    hasCopiedTossAccountInfo.value = success

    return success
  }

  const showTossInstructionDialog = (seconds: number): Promise<boolean> => {
    if (!tossInfo.value) {
      return Promise.resolve(false)
    }

    isTossInstructionDialogVisible.value = true

    return tossCountdownManager.start(seconds)
  }

  const closeTossInstructionDialog = () => {
    tossCountdownManager.cancel()

    isTossInstructionDialogVisible.value = false
    tossInstructionCountdown.value = 0
    hasCopiedTossAccountInfo.value = false
    tossDeepLinkUrl.value = null
  }

  const completeTossInstructionCountdown = () => {
    tossCountdownManager.complete()
  }

  const completeTossInstructionDialog = () => {
    tossCountdownManager.reset()
    tossInstructionCountdown.value = 0
  }

  const setTossDeepLinkUrl = (url: string | null) => {
    tossDeepLinkUrl.value = url
  }

  const reopenTossDeepLink = async () => {
    if (!tossDeepLinkUrl.value) {
      return
    }

    const deepLink = tossDeepLinkUrl.value
    await launchDeepLink(deepLink, {
      timeoutMs: 2000,
      waitForDeepLinkResult: waitForDeepLinkLaunch,
      onCheckingChange: setDeepLinkChecking,
      onNotInstalled: () => showPopup('not-installed', 'toss'),
      onNotMobile: () => showPopup('not-mobile', 'toss', { deepLinkUrl: deepLink }),
      isMobileDevice,
    })
  }

  const workflowContext = buildWorkflowContext(
    paymentStore,
    paymentInfoStore,
    showPopup,
    setDeepLinkChecking,
    openTransferDialog,
    copyTossAccountInfo,
    showTossInstructionDialog,
    completeTossInstructionDialog,
    setTossDeepLinkUrl,
  )

  const resolveAction = createPaymentActionResolver(workflowContext)

  const handleMethodSelection = async (methodId: string) => {
    paymentStore.selectMethod(methodId)

    const method = selectedMethod.value

    if (!method || isCurrencySelectorOpen.value) {
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

    if (selectedCurrency.value !== currency) {
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
    isTossInstructionDialogVisible,
    tossInstructionCountdown,
    hasCopiedTossAccountInfo,
    tossAccountInfo: tossInfo,
    closePopup,
    closeTransferDialog,
    completeTossInstructionCountdown,
    closeTossInstructionDialog,
    reopenTossDeepLink,
    handleMethodSelection,
    handleCurrencySelection,
  }
})
