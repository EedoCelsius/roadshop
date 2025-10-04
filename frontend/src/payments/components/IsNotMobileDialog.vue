<script setup lang="ts">
import { computed, ref } from 'vue'

import DialogCloseFull from '@/shared/components/DialogCloseFull.vue'
import QrCodeDisplay from '@/shared/components/QrCodeDisplay.vue'
import { useI18nStore } from '@/localization/store'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'
import type { PaymentIcon } from '@/payments/types'

type DeepLinkCapableMethod = 'toss' | 'kakao'

interface Props {
  method: DeepLinkCapableMethod
}

const props = defineProps<Props>()

const emit = defineEmits<{ close: [] }>()

const paymentStore = usePaymentStore()
const i18nStore = useI18nStore()
const paymentInfoStore = usePaymentInfoStore()

const isVisible = ref(false)
const qrValue = computed(() => {
  try {
    return paymentInfoStore.getMethodDeepLink(props.method)
  } catch (error) {
    console.error(error)
    return null
  }
})

const paymentMethod = computed(() => paymentStore.getMethodById(props.method) ?? null)
const methodLabel = computed(() => i18nStore.t(`options.${props.method}`, props.method))
const icon = computed<PaymentIcon | null>(() => paymentMethod.value?.icons?.[0] ?? null)
const title = computed(() => i18nStore.t('dialogs.notMobile.title'))
const confirmLabel = computed(() => i18nStore.t('dialogs.confirm'))
const description = computed(() => i18nStore.t('dialogs.notMobile.description').replace('{method}', methodLabel.value))
const qrHint = computed(() => i18nStore.t('dialogs.notMobile.qrHint').replace('{method}', methodLabel.value))

const close = () => {
  isVisible.value = false
  emit('close')
}

const open = () => {
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
