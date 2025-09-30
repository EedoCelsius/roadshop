<script setup lang="ts">
import { computed } from 'vue'

import { useI18nStore } from '@/localization/store'
import AccountInfoCard from '@/payments/components/AccountInfoCard.vue'
import AppDialog from '@/shared/components/AppDialog.vue'
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
  <AppDialog
    :visible="props.visible"
    :title="title"
    :description="description"
    close-alignment="full"
    @close="onClose"
  >
    <div class="flex flex-col gap-4">
      <p v-if="props.copied" class="text-xs font-medium text-emerald-600">
        {{ copiedLabel }}
      </p>
      <AccountInfoCard
        v-if="props.info"
        :bank-name="props.info.bankName"
        :account-no="props.info.accountNo"
        :account-holder="props.info.accountHolder"
      />
      <div
        class="flex items-center justify-center"
      >
        <button
          v-if="isCountingDown"
          type="button"
          class="font-semibold text-roadshop-primary cursor-pointer"
          @click="onLaunchNow"
        >
          {{ countdownLabel }}
        </button>
        <button
          v-else
          type="button"
          class="font-semibold text-roadshop-primary underline underline-offset-2"
          @click="onReopen"
        >
          {{ reopenLabel }}
        </button>
      </div>
    </div>
  </AppDialog>
</template>
