import { computed, ref } from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { useI18nStore } from '@/localization/store'
import {
  isDeepLinkChecking as deepLinkChecking,
  launchDeepLink,
  resolveDeepLink,
} from '@/payments/services/deepLinkService'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { createCountdownManager } from '@/payments/stores/utils/createCountdownManager'
import type { DeepLinkProvider, PaymentMethod } from '@/payments/types'
import { copyTransferInfo } from '@/payments/utils/copyTransferInfo'
import { openUrlInNewTab } from '@/shared/utils/navigation'

type DeepLinkDialogType = 'not-mobile' | 'not-installed'

type DeepLinkDialogOptions = {
  deepLinkUrl?: string | null
}

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

  const formatDialogMessage = (key: string, provider: DeepLinkProvider) => {
    const template = i18nStore.t(key)

    if (template === key) {
      return template
    }

    const methodLabel = i18nStore.t(`options.${provider}`, provider)

    return template.replace('{method}', methodLabel)
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
      message: formatDialogMessage(messageKey, provider),
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

    const success = await copyTransferInfo(tossInfo.value.account, tossInfo.value.amount.krw)
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

  const openMethodUrl = async (method: PaymentMethod, currency: string | null) => {
    const ready = await paymentInfoStore.ensureMethodInfo(method.id)

    if (!ready) {
      return
    }

    const url = paymentInfoStore.getMethodUrl(method.id, currency ?? undefined)
    openUrlInNewTab(url)
  }

  const runTransferWorkflow = async () => {
    const ready = await paymentInfoStore.ensureMethodInfo('transfer')

    if (!ready) {
      return
    }

    openTransferDialog()
  }

  const resolveDeepLinkFor = async (provider: DeepLinkProvider) => {
    const ready = await paymentInfoStore.ensureMethodInfo(provider)

    if (!ready) {
      return null
    }

    const info = paymentInfoStore.getDeepLinkInfo(provider)

    if (!info) {
      console.error(`Missing ${provider} payment info payload`)
      return null
    }

    try {
      return resolveDeepLink(provider, info)
    } catch (error) {
      console.error(error)
      return null
    }
  }

  const runKakaoWorkflow = async () => {
    const deepLink = await resolveDeepLinkFor('kakao')

    if (!deepLink) {
      return
    }

    await launchDeepLink(deepLink, {
      timeoutMs: 1500,
      onNotInstalled: () => showDialog('not-installed', 'kakao'),
      onNotMobile: () => showDialog('not-mobile', 'kakao', { deepLinkUrl: deepLink }),
    })
  }

  const runTossWorkflow = async () => {
    setTossDeepLinkUrl(null)

    const deepLink = await resolveDeepLinkFor('toss')

    if (!deepLink) {
      return
    }

    setTossDeepLinkUrl(deepLink)

    await copyTossAccountInfo()
    const shouldLaunch = await showTossInstructionDialog(5)

    if (!shouldLaunch) {
      completeTossInstructionDialog()
      return
    }

    try {
      await launchDeepLink(deepLink, {
        timeoutMs: 2000,
        onNotInstalled: () => showDialog('not-installed', 'toss'),
        onNotMobile: () => showDialog('not-mobile', 'toss', { deepLinkUrl: deepLink }),
      })
    } finally {
      completeTossInstructionDialog()
    }
  }

  const runWorkflowForMethod = async (method: PaymentMethod, currency: string | null) => {
    switch (method.id) {
      case 'transfer':
        await runTransferWorkflow()
        break
      case 'toss':
        await runTossWorkflow()
        break
      case 'kakao':
        await runKakaoWorkflow()
        break
      default:
        await openMethodUrl(method, currency)
    }
  }

  const handleMethodSelection = async (methodId: string) => {
    paymentStore.selectMethod(methodId)

    const method = selectedMethod.value

    if (!method || isCurrencySelectorOpen.value) {
      return
    }

    await runWorkflowForMethod(method, selectedCurrency.value)
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

    await runWorkflowForMethod(method, currency)
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
