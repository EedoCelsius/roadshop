<script setup lang="ts">
import { computed } from 'vue'

import { useI18nStore } from '@/localization/store'
import AccountInfoCard from '@/payments/components/AccountInfoCard.vue'
import type { TossPaymentInfo } from '@/payments/services/paymentInfoService'

interface Props {
  visible: boolean
  info: TossPaymentInfo | null
  countdown: number
  copied: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'reopen'): void
  (event: 'launch-now'): void
}>()

const i18nStore = useI18nStore()

const title = computed(() => i18nStore.t('tossInstruction.title'))
const description = computed(() => i18nStore.t('tossInstruction.description'))
const copiedLabel = computed(() => i18nStore.t('tossInstruction.copied'))
const countdownLabel = computed(() => {
  if (props.countdown > 0) {
    return i18nStore.t('tossInstruction.countdown').replace(
      '{seconds}',
      props.countdown.toString(),
    )
  }

  return ''
})

const reopenLabel = computed(() => i18nStore.t('tossInstruction.reopen'))
const isCountingDown = computed(() => props.countdown > 0)
const closeLabel = computed(() => i18nStore.t('dialog.close'))

const onClose = () => {
  emit('close')
}

const onReopen = () => {
  emit('reopen')
}

const onLaunchNow = () => {
  emit('launch-now')
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    dismissable-mask
    close-on-escape
    :header="title"
    :style="{ width: 'min(90vw, 28rem)' }"
    :pt="{
      root: { class: 'rounded-3xl border-0 bg-white/95 shadow-xl backdrop-blur-sm' },
      mask: { class: 'bg-slate-900/40 backdrop-blur-sm' },
      header: { class: 'text-roadshop-primary font-semibold text-lg' },
      content: { class: 'text-slate-600' },
      footer: { class: 'flex justify-end' },
    }"
    @update:visible="(value) => {
      if (!value) {
        onClose()
      }
    }"
  >
    <div class="flex flex-col gap-4">
      <p class="text-sm leading-relaxed text-slate-600">{{ description }}</p>
      <Tag
        v-if="props.copied"
        :value="copiedLabel"
        severity="success"
        :pt="{ root: { class: 'w-full justify-center bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-medium' } }"
      />
      <AccountInfoCard
        v-if="props.info"
        :bank-name="props.info.bankName"
        :account-no="props.info.accountNo"
        :account-holder="props.info.accountHolder"
      />
      <div class="flex items-center justify-center">
        <Button
          v-if="isCountingDown"
          type="button"
          text
          severity="primary"
          :label="countdownLabel"
          @click="onLaunchNow"
        />
        <Button
          v-else
          type="button"
          text
          severity="primary"
          :label="reopenLabel"
          @click="onReopen"
        />
      </div>
    </div>
    <template #footer>
      <Button type="button" :label="closeLabel" text severity="secondary" @click="onClose" />
    </template>
  </Dialog>
</template>
