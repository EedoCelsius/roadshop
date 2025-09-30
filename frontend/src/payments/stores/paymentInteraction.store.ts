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
import { copyText } from '@/shared/utils/clipboard'

type PopupType = 'not-mobile' | 'not-installed'

const buildWorkflowContext = (
  paymentStore: ReturnType<typeof usePaymentStore>,
  paymentInfoStore: ReturnType<typeof usePaymentInfoStore>,
  showPopup: (type: PopupType, provider: DeepLinkProvider) => void,
  setDeepLinkChecking: (value: boolean) => void,
  openTransferDialog: () => void,
  copyTossAccountInfo: () => Promise<boolean>,
  showTossInstructionDialog: (seconds: number) => Promise<void>,
  completeTossInstructionDialog: () => void,
  setTossDeepLinkUrl: (url: string | null) => void,
): PaymentActionContext => ({
  openTransferDialog,
  openMethodUrl: (method: PaymentMethod, currency: string | null) => {
    const url = paymentStore.getUrlForMethod(method.id, currency ?? undefined)
    openUrlInNewTab(url)
  },
  ensurePaymentInfoLoaded: paymentInfoStore.ensureLoaded,
  getDeepLinkInfo: paymentInfoStore.getDeepLinkInfo,
  showDeepLinkPopup: showPopup,
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
    title: string
    message: string
    confirmLabel: string
  } | null>(null)
  const isDeepLinkChecking = ref(false)
  const isTransferDialogVisible = ref(false)
  const isTossInstructionDialogVisible = ref(false)
  const tossInstructionCountdown = ref(0)
  const hasCopiedTossAccountInfo = ref(false)
  const tossDeepLinkUrl = ref<string | null>(null)
  let tossCountdownTimer: ReturnType<typeof setInterval> | null = null
  let tossCountdownResolver: (() => void) | null = null

  const transferAmount = computed(() => paymentInfoStore.transferInfo?.amount.krw ?? 0)
  const transferAccounts = computed(() => paymentInfoStore.transferInfo?.account ?? [])

  const isPopupVisible = computed(() => popupContent.value !== null)

  const closePopup = () => {
    popupContent.value = null
  }

  const showPopup = (type: PopupType, provider: DeepLinkProvider) => {
    const baseKey = 'popups.deepLink'
    const keySuffix = type === 'not-mobile' ? 'notMobile' : 'notInstalled'

    popupContent.value = {
      title: i18nStore.t(`${baseKey}.titles.${keySuffix}`),
      message: i18nStore.t(`${baseKey}.providers.${provider}.${keySuffix}`),
      confirmLabel: i18nStore.t(`${baseKey}.confirms.${keySuffix}`),
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
    const payload = `${tossInfo.value.bankName} ${tossInfo.value.accountHolder} ${tossInfo.value.accountNo} ${amountText}원`
    const success = await copyText(payload)

    hasCopiedTossAccountInfo.value = success

    return success
  }

  const showTossInstructionDialog = (seconds: number): Promise<void> => {
    if (!tossInfo.value) {
      return Promise.resolve()
    }

    if (tossCountdownTimer) {
      clearInterval(tossCountdownTimer)
      tossCountdownTimer = null
    }

    tossInstructionCountdown.value = Math.max(0, seconds)
    isTossInstructionDialogVisible.value = true

    if (tossInstructionCountdown.value === 0) {
      return Promise.resolve()
    }

    return new Promise<void>((resolve) => {
      tossCountdownResolver = resolve
      tossCountdownTimer = setInterval(() => {
        if (tossInstructionCountdown.value <= 1) {
          if (tossCountdownTimer) {
            clearInterval(tossCountdownTimer)
            tossCountdownTimer = null
          }

          tossInstructionCountdown.value = 0

          if (tossCountdownResolver) {
            const countdownResolve = tossCountdownResolver
            tossCountdownResolver = null
            countdownResolve()
          }

          return
        }

        tossInstructionCountdown.value -= 1
      }, 1000)
    })
  }

  const closeTossInstructionDialog = () => {
    if (tossCountdownTimer) {
      clearInterval(tossCountdownTimer)
      tossCountdownTimer = null
    }

    if (tossCountdownResolver) {
      const resolve = tossCountdownResolver
      tossCountdownResolver = null
      resolve()
    }

    isTossInstructionDialogVisible.value = false
    tossInstructionCountdown.value = 0
    hasCopiedTossAccountInfo.value = false
    tossDeepLinkUrl.value = null
  }

  const completeTossInstructionDialog = () => {
    if (tossCountdownTimer) {
      clearInterval(tossCountdownTimer)
      tossCountdownTimer = null
    }

    tossCountdownResolver = null
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
    const isMobile = isMobileDevice()

    if (!isMobile) {
      openUrlInNewTab(deepLink)
      return
    }

    setDeepLinkChecking(true)

    try {
      const launchMonitor = waitForDeepLinkLaunch(2000)

      if (typeof window === 'undefined' || typeof document === 'undefined') {
        openUrlInNewTab(deepLink)
        await launchMonitor
        return
      }

      window.location.href = deepLink

      const didLaunch = await launchMonitor

      if (!didLaunch) {
        showPopup('not-installed', 'toss')
      }
    } finally {
      setDeepLinkChecking(false)
    }
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
    isTossInstructionDialogVisible,
    tossInstructionCountdown,
    hasCopiedTossAccountInfo,
    tossAccountInfo: tossInfo,
    closePopup,
    closeTransferDialog,
    closeTossInstructionDialog,
    reopenTossDeepLink,
    handleMethodSelection,
    handleCurrencySelection,
  }
})
