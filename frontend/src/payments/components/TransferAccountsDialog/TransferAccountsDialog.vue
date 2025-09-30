<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useI18nStore } from '@/localization/store'
import type { TransferAccount } from '@/payments/services/paymentInfoService'
import { copyText } from '@/shared/utils/clipboard'

import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InlineMessage from 'primevue/inlinemessage'
import Avatar from 'primevue/avatar'
import { useToast } from 'primevue/usetoast'

type CopyAction = 'all' | 'number'

interface Props {
  visible: boolean
  amount: number
  accounts: TransferAccount[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
}>()

const i18nStore = useI18nStore()
const { locale } = storeToRefs(i18nStore)

const toast = useToast()

const firmIcons = import.meta.glob('@icons/firms/*.svg', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const firmIconMap = Object.entries(firmIcons).reduce<Record<string, string>>((acc, [path, value]) => {
  const segments = path.split('/')
  const filename = segments[segments.length - 1] ?? ''
  const name = filename.replace('.svg', '')
  acc[name] = value
  return acc
}, {})

const localeNumberFormats: Record<string, string> = {
  en: 'en-US',
  ko: 'ko-KR',
  ja: 'ja-JP',
  zh: 'zh-CN',
}

const numberFormatter = computed(() => new Intl.NumberFormat(localeNumberFormats[locale.value] ?? 'en-US'))
const formattedAmount = computed(() => numberFormatter.value.format(props.amount))

const formattedAmountWithCurrency = computed(() => {
  switch (locale.value) {
    case 'ko':
      return `${formattedAmount.value}원`
    case 'zh':
      return `${formattedAmount.value} 韩元`
    case 'ja':
      return `${formattedAmount.value} KRW`
    default:
      return `${formattedAmount.value} KRW`
  }
})

const formattedAmountForCopy = computed(() => new Intl.NumberFormat('ko-KR').format(props.amount))

const title = computed(() => i18nStore.t('transferPopup.title'))
const descriptionHtml = computed(() =>
  i18nStore
    .t('transferPopup.description')
    .replace(
      '{amountWithCurrency}',
      `<strong class="font-semibold text-primary">${formattedAmountWithCurrency.value}</strong>`,
    ),
)
const copyAllLabel = computed(() => i18nStore.t('transferPopup.copyAll'))
const copyNumberLabel = computed(() => i18nStore.t('transferPopup.copyNumber'))
const copiedNumberLabel = computed(() => i18nStore.t('transferPopup.copiedNumber'))
const copyAllButtonLabel = computed(() => i18nStore.t('transferPopup.copyAllButton'))
const copiedAllButtonLabel = computed(() => i18nStore.t('transferPopup.copiedAllButton'))

const copyFeedback = ref<{ accountNumber: string; action: CopyAction } | null>(null)
let resetTimer: number | null = null

const showCopyFeedback = (accountNumber: string, action: CopyAction) => {
  copyFeedback.value = { accountNumber, action }

  if (typeof window !== 'undefined') {
    if (resetTimer) {
      window.clearTimeout(resetTimer)
    }

    resetTimer = window.setTimeout(() => {
      copyFeedback.value = null
      resetTimer = null
    }, 2000)
  }
}

const isCopied = (accountNumber: string, action: CopyAction) =>
  copyFeedback.value?.accountNumber === accountNumber && copyFeedback.value?.action === action

const getIconForBank = (bank: string) => firmIconMap[bank] ?? null

const notifyCopy = (message: string) => {
  toast.add({ severity: 'success', summary: message, life: 2000 })
}

const copyTransferDetails = async (account: TransferAccount) => {
  const amountText = `${formattedAmountForCopy.value}원`
  const payload = `${account.bank} ${account.number} ${account.holder} [${amountText}]`
  const success = await copyText(payload)

  if (success) {
    showCopyFeedback(account.number, 'all')
    notifyCopy(copiedAllButtonLabel.value)
  }
}

const copyAccountNumber = async (account: TransferAccount) => {
  const success = await copyText(account.number)

  if (success) {
    showCopyFeedback(account.number, 'number')
    notifyCopy(copiedNumberLabel.value)
  }
}

const resetFeedback = () => {
  copyFeedback.value = null
  if (typeof window !== 'undefined' && resetTimer) {
    window.clearTimeout(resetTimer)
    resetTimer = null
  }
}

const onClose = () => {
  emit('close')
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetFeedback()
    }
  },
)

onBeforeUnmount(() => {
  resetFeedback()
})
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    :draggable="false"
    :breakpoints="{ '960px': '95vw' }"
    style="width: 34rem"
    @hide="onClose"
  >
    <template #header>
      <div class="flex flex-column gap-1">
        <span class="font-semibold text-lg text-primary">{{ title }}</span>
        <p class="m-0 text-sm text-color-secondary" v-html="descriptionHtml"></p>
      </div>
    </template>
    <div class="flex flex-column gap-3">
      <div
        v-for="account in props.accounts"
        :key="account.number"
        class="surface-card border-1 border-round-2xl shadow-1 overflow-hidden"
      >
        <div class="flex flex-column sm:flex-row">
          <div class="flex flex-1 align-items-start gap-3 surface-100 p-4">
            <Avatar
              v-if="getIconForBank(account.bank)"
              shape="circle"
              size="large"
              class="shadow-1"
              :image="getIconForBank(account.bank)"
              :label="account.bank"
              :pt="{ image: { alt: account.bank } }"
            />
            <div class="flex flex-column gap-2">
              <div class="flex align-items-center gap-2 flex-wrap">
                <span class="text-base font-semibold text-primary">{{ account.bank }}</span>
                <span class="text-xs text-color-secondary">{{ account.holder }}</span>
              </div>
              <div class="flex flex-column gap-1">
                <Button
                  :label="account.number"
                  :icon="isCopied(account.number, 'number') ? 'pi pi-check' : 'pi pi-copy'"
                  icon-pos="right"
                  link
                  :aria-label="copyNumberLabel"
                  class="p-0 font-mono text-sm"
                  @click="copyAccountNumber(account)"
                />
                <InlineMessage
                  v-if="isCopied(account.number, 'number')"
                  severity="success"
                  class="w-full"
                >
                  {{ copiedNumberLabel }}
                </InlineMessage>
              </div>
            </div>
          </div>
          <div class="flex align-items-center justify-content-center surface-200 sm:w-10rem">
            <Button
              :label="isCopied(account.number, 'all') ? copiedAllButtonLabel : copyAllButtonLabel"
              :icon="isCopied(account.number, 'all') ? 'pi pi-check' : 'pi pi-clipboard'"
              :severity="isCopied(account.number, 'all') ? 'success' : 'primary'"
              icon-pos="right"
              class="w-full sm:w-auto"
              :aria-label="copyAllLabel"
              @click="copyTransferDetails(account)"
            />
          </div>
        </div>
      </div>
    </div>
  </Dialog>
</template>
