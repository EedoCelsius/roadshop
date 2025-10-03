<script setup lang="ts">
import { computed, ref } from 'vue'

import DialogCloseFull from '@/shared/components/DialogCloseFull.vue'
import QrCodeDisplay from '@/shared/components/QrCodeDisplay.vue'
import { useI18nStore } from '@/localization/store'
import { usePaymentStore } from '@/payments/stores/payment.store'
import type { PaymentIcon } from '@/payments/types'

interface Props {
  methodId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{ close: [] }>()

const paymentStore = usePaymentStore()
const i18nStore = useI18nStore()

const isVisible = ref(false)
const qrValue = ref<string | null>(null)

const method = computed(() => paymentStore.getMethodById(props.methodId) ?? null)
const methodLabel = computed(() => i18nStore.t(`options.${props.methodId}`, props.methodId))
const icon = computed<PaymentIcon | null>(() => method.value?.icons?.[0] ?? null)
const title = computed(() => i18nStore.t('dialogs.notMobile.title'))
const confirmLabel = computed(() => i18nStore.t('dialogs.confirm'))
const description = computed(() => {
  const template = i18nStore.t('dialogs.notMobile.description')
  return template.includes('{method}') ? template.replace('{method}', methodLabel.value) : template
})
const qrHint = computed(() => {
  if (!isVisible.value || !qrValue.value) {
    return null
  }

  for (const key of ['dialogs.notMobile.qrHint', 'dialogs.notInstalled.qrHint']) {
    const template = i18nStore.t(key)
    if (template === key) {
      continue
    }

    return template.includes('{method}') ? template.replace('{method}', methodLabel.value) : template
  }

  return null
})

const close = () => {
  isVisible.value = false
  qrValue.value = null
  emit('close')
}

const open = (options: { qrValue?: string | null } = {}) => {
  qrValue.value = options.qrValue ?? null
  isVisible.value = true
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <DialogCloseFull
    v-if="isVisible"
    :title="title"
    :description="description"
    :close-label="confirmLabel"
    @close="close"
  >
    <div v-if="qrValue" class="mt-6 flex flex-col items-center gap-3">
      <QrCodeDisplay :value="qrValue" :icon="icon ?? undefined" />
      <p v-if="qrHint" class="text-center text-xs text-slate-500">
        {{ qrHint }}
        <i class="pi pi-camera"></i>
      </p>
    </div>
  </DialogCloseFull>
</template>
