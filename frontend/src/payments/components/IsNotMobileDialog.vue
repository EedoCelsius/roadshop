<script setup lang="ts">
import DialogCloseFull from '@/shared/components/DialogCloseFull.vue'
import QrCodeDisplay from '@/shared/components/QrCodeDisplay.vue'
import type { PaymentIcon } from '@/payments/types'

const props = defineProps<{
  visible: boolean
  title: string
  description?: string
  confirmLabel?: string
  qrValue?: string | null
  qrHint?: string | null
  qrIcon?: PaymentIcon | null
}>()

const emit = defineEmits<{
  close: []
}>()

const onClose = () => {
  emit('close')
}
</script>

<template>
  <DialogCloseFull
    :visible="props.visible"
    :title="props.title"
    :description="props.description"
    :close-label="props.confirmLabel"
    @close="onClose"
  >
    <div v-if="props.qrValue" class="mt-6 flex flex-col items-center gap-3">
      <QrCodeDisplay :value="props.qrValue" :icon="props.qrIcon ?? undefined" />
      <p v-if="props.qrHint" class="text-center text-xs text-slate-500">
        {{ props.qrHint }}
        <i class="pi pi-camera"></i>
      </p>
    </div>
  </DialogCloseFull>
</template>
