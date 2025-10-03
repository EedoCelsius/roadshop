import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useI18nStore } from '@/localization/store'
import { isDeepLinkChecking as deepLinkChecking, launchDeepLink } from '@/payments/services/deepLinkService'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { createCountdownManager } from '@/payments/stores/utils/createCountdownManager'
import type { DeepLinkProvider, PaymentMethod } from '@/payments/types'
import { createPaymentActionResolver } from '@/payments/workflows/createPaymentActionResolver'
import type {
  DeepLinkDialogOptions,
  DeepLinkDialogType,
  PaymentActionContext,
} from '@/payments/workflows/types'
import { openUrlInNewTab } from '@/shared/utils/navigation'
import { copyText } from '@/shared/utils/clipboard'

const buildWorkflowContext = (
  paymentStore: ReturnType<typeof usePaymentStore>,
  paymentInfoStore: ReturnType<typeof usePaymentInfoStore>,
  showDialog: (
    type: DeepLinkDialogType,
    provider: DeepLinkProvider,
    options?: DeepLinkDialogOptions,
  ) => void,
  openTransferDialog: () => void,
  copyTossAccountInfo: () => Promise<boolean>,
  showTossInstructionDialog: (seconds: number) => Promise<boolean>,
  completeTossInstructionDialog: () => void,
  setTossDeepLinkUrl: (url: string | null) => void,
): PaymentActionContext => ({
  openTransferDialog,
  openMethodUrl: async (method: PaymentMethod, currency: string | null) => {
    const ready = await paymentInfoStore.ensureMethodInfo(method.id)

    if (!ready) {
      return
    }

    const url = paymentInfoStore.getMethodUrl(method.id, currency ?? undefined)
    openUrlInNewTab(url)
  },
  ensureMethodInfoLoaded: paymentInfoStore.ensureMethodInfo,
  getDeepLinkInfo: paymentInfoStore.getDeepLinkInfo,
  showDeepLinkDialog: showDialog,
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

  const dialogContent = ref<{
    type: DeepLinkDialogType
    provider: DeepLinkProvider
    title: string
    message: string
    confirmLabel: string
    deepLinkUrl: string | null
  } | null>(null)
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

  const isDialogVisible = computed(() => dialogContent.value !== null)

  const closeDialog = () => {
    dialogContent.value = null
  }

  const formatProviderMessage = (key: string, provider: DeepLinkProvider) => {
    const template = i18nStore.t(key)

    if (template === key) {
      return template
    }

    const providerLabel = i18nStore.t(`options.${provider}`, provider)

    return template.split('{provider}').join(providerLabel)
  }

  const showDialog = (
    type: DeepLinkDialogType,
    provider: DeepLinkProvider,
    options: DeepLinkDialogOptions = {},
  ) => {
    const baseKey = type === 'not-mobile' ? 'dialogs.notMobile' : 'dialogs.notInstalled'
    const messageKey = `${baseKey}.description`

    dialogContent.value = {
      type,
      provider,
      title: i18nStore.t(`${baseKey}.title`),
      message: formatProviderMessage(messageKey, provider),
      confirmLabel: i18nStore.t('dialogs.confirm'),
      deepLinkUrl: options.deepLinkUrl ?? null,
    }
  }

  const openTransferDialog = () => {
    isTransferDialogVisible.value = true
  }

  const closeTransferDialog = () => {
    isTransferDialogVisible.value = false
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
      onNotInstalled: () => showDialog('not-installed', 'toss'),
      onNotMobile: () => showDialog('not-mobile', 'toss', { deepLinkUrl: deepLink }),
    })
  }

  const workflowContext = buildWorkflowContext(
    paymentStore,
    paymentInfoStore,
    showDialog,
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
    isDialogVisible,
    dialogContent,
    isDeepLinkChecking: deepLinkChecking,
    isTransferDialogVisible,
    transferAmount,
    transferAccounts,
    isTossInstructionDialogVisible,
    tossInstructionCountdown,
    hasCopiedTossAccountInfo,
    tossAccountInfo: tossInfo,
    closeDialog,
    closeTransferDialog,
    completeTossInstructionCountdown,
    closeTossInstructionDialog,
    reopenTossDeepLink,
    handleMethodSelection,
    handleCurrencySelection,
  }
})
