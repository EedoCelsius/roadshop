<script setup lang="ts">
import { computed, ref } from 'vue'

import IsNotInstalledDialog from '@/payments/components/IsNotInstalledDialog.vue'
import IsNotMobileDialog from '@/payments/components/IsNotMobileDialog.vue'
import { resolveDeepLink, launchDeepLink } from '@/payments/services/deepLinkService'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { useI18nStore } from '@/localization/store'
import type { PaymentIcon } from '@/payments/types'

interface DeepLinkDialog {
  type: 'not-mobile' | 'not-installed'
  title: string
  message: string
  confirmLabel: string
  qrValue: string | null
}

const paymentInfoStore = usePaymentInfoStore()
const paymentStore = usePaymentStore()
const i18nStore = useI18nStore()

const dialog = ref<DeepLinkDialog | null>(null)

const kakaoIcon = computed<PaymentIcon | null>(() => paymentStore.getMethodById('kakao')?.icons?.[0] ?? null)
const methodLabel = computed(() => i18nStore.t('options.kakao', 'kakao'))

const isDialogVisible = computed(() => dialog.value !== null)
const isNotMobileDialog = computed(() => dialog.value?.type === 'not-mobile')
const isNotInstalledDialog = computed(() => dialog.value?.type === 'not-installed')

const resolveQrHint = (type: DeepLinkDialog['type']) => {
  const candidateKeys =
    type === 'not-mobile'
      ? ['dialogs.notMobile.qrHint', 'dialogs.notInstalled.qrHint']
      : ['dialogs.notInstalled.qrHint']

  for (const key of candidateKeys) {
    const template = i18nStore.t(key)

    if (template === key) {
      continue
    }

    return template.replace('{method}', methodLabel.value)
  }

  return null
}

const qrHint = computed(() => {
  if (!dialog.value?.qrValue || !dialog.value?.type) {
    return null
  }

  return resolveQrHint(dialog.value.type)
})

const closeDialog = () => {
  dialog.value = null
}

const showDialog = (type: DeepLinkDialog['type'], options: { qrValue?: string | null } = {}) => {
  const baseKey = type === 'not-mobile' ? 'dialogs.notMobile' : 'dialogs.notInstalled'

  const messageKey = `${baseKey}.description`
  const template = i18nStore.t(messageKey)
  const message =
    template === messageKey ? template : template.replace('{method}', methodLabel.value)

  dialog.value = {
    type,
    title: i18nStore.t(`${baseKey}.title`),
    message,
    confirmLabel: i18nStore.t('dialogs.confirm'),
    qrValue: options.qrValue ?? null,
  }
}

const run = async (): Promise<boolean> => {
  const ready = await paymentInfoStore.ensureMethodInfo('kakao')

  if (!ready) {
    return false
  }

  const info = paymentInfoStore.getDeepLinkInfo('kakao')

  if (!info) {
    console.error('Missing kakao payment info payload')
    return false
  }

  try {
    const deepLink = resolveDeepLink('kakao', info)

    await launchDeepLink(deepLink, {
      timeoutMs: 1500,
      onNotInstalled: () => showDialog('not-installed'),
      onNotMobile: () => showDialog('not-mobile', { qrValue: deepLink }),
    })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const onDialogClose = () => {
  closeDialog()
}

defineExpose({
  run,
})
</script>

<template>
  <IsNotMobileDialog
    v-if="isDialogVisible && isNotMobileDialog && dialog"
    :visible="isDialogVisible"
    :title="dialog.title"
    :description="dialog.message"
    :confirm-label="dialog.confirmLabel"
    :qr-value="dialog.qrValue"
    :qr-hint="qrHint"
    :qr-icon="kakaoIcon"
    @close="onDialogClose"
  />
  <IsNotInstalledDialog
    v-else-if="isDialogVisible && isNotInstalledDialog && dialog"
    :visible="isDialogVisible"
    :title="dialog.title"
    :description="dialog.message"
    :confirm-label="dialog.confirmLabel"
    @close="onDialogClose"
  />
</template>
