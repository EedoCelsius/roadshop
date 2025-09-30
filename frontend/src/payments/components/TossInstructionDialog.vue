<script setup lang="ts">
import { computed } from 'vue'

import { useI18nStore } from '@/localization/store'
import AccountInfoCard from '@/payments/components/AccountInfoCard.vue'
import DialogBase from '@/shared/components/DialogBase.vue'
import type { TossPaymentInfo } from '@/payments/services/paymentInfoService'

interface Props {
  visible: boolean
  info: TossPaymentInfo | null
  countdown: number
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
const closeLabel = computed(() => i18nStore.t('dialog.close'))
const launchLabel = computed(() => i18nStore.t('tossInstruction.launchCta'))
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
  <DialogBase
    :visible="props.visible"
    :title="title"
    :description="description"
    @close="onClose"
  >
    <div class="flex flex-col gap-4">
      <AccountInfoCard
        v-if="props.info"
        :bank-name="props.info.bankName"
        :account-no="props.info.accountNo"
        :account-holder="props.info.accountHolder"
      />
    </div>
    <template #footer="{ onClose: closeDialog }">
      <footer class="mt-6 flex flex-col gap-2">
        <button
          v-if="isCountingDown"
          type="button"
          class="w-full rounded-xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500/90"
          @click="onLaunchNow"
        >
          <span class="flex items-center justify-center gap-2">
            <span class="relative inline-flex h-6 w-6 items-center justify-center">
              <span class="absolute inset-0 animate-spin rounded-full border-2 border-white/40 border-t-white"></span>
              <span class="text-xs font-semibold leading-none text-white">
                {{ props.countdown }}
              </span>
            </span>
            <span>{{ launchLabel }}</span>
          </span>
        </button>
        <button
          v-else
          type="button"
          class="w-full rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600/90"
          @click="onReopen"
        >
          {{ reopenLabel }}
        </button>
        <button
          type="button"
          class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          @click="closeDialog()"
        >
          {{ closeLabel }}
        </button>
      </footer>
    </template>
  </DialogBase>
</template>
