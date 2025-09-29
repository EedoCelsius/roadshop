<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useI18nStore } from '@/localization/store'
import type { TransferAccount } from '@/payments/services/paymentInfoService'
import TooltipBubble from '@/shared/components/TooltipBubble.vue'
import AppDialog from '@/shared/components/AppDialog.vue'
import clipboardIcon from '@icons/ui/clipboard.svg?raw'
import successIcon from '@icons/ui/success.svg?raw'

import { useTransferCopyState, type CopyAction } from './useTransferCopyState'

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

const { isCopied, isTooltipVisible, setHoveredControl, handleCopyAll, handleCopyNumber, reset } =
  useTransferCopyState()

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
      `<strong class="font-semibold text-roadshop-primary">${formattedAmountWithCurrency.value}</strong>`,
    ),
)
const copyAllLabel = computed(() => i18nStore.t('transferPopup.copyAll'))
const copyNumberLabel = computed(() => i18nStore.t('transferPopup.copyNumber'))
const copyTooltipLabel = computed(() => i18nStore.t('transferPopup.copyTooltip'))
const copiedLabel = computed(() => i18nStore.t('transferPopup.copied'))
const copiedNumberLabel = computed(() => i18nStore.t('transferPopup.copiedNumber'))
const copyAllButtonLabel = computed(() => i18nStore.t('transferPopup.copyAllButton'))
const copiedAllButtonLabel = computed(() => i18nStore.t('transferPopup.copiedAllButton'))

const getIconForBank = (bank: string) => firmIconMap[bank] ?? null

const getTooltipVariant = (accountNumber: string, action: CopyAction) =>
  isCopied(accountNumber, action) ? 'success' : 'default'

const getTooltipMessage = (accountNumber: string, action: CopyAction) => {
  if (isCopied(accountNumber, action)) {
    return action === 'all' ? copiedLabel.value : copiedNumberLabel.value
  }

  return action === 'all' ? copyTooltipLabel.value : copyNumberLabel.value
}

const copyTransferDetails = async (account: TransferAccount) => {
  const amountText = `${formattedAmountForCopy.value}원`
  const payload = `${account.bank} ${account.number} ${account.holder} [${amountText}]`
  await handleCopyAll(account.number, payload)
}

const copyAccountNumber = async (account: TransferAccount) => {
  await handleCopyNumber(account.number)
}

const setHoverState = (accountNumber: string, action: CopyAction, value: boolean) => {
  setHoveredControl(accountNumber, action, value)
}

const onClose = () => {
  emit('close')
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      reset()
    }
  },
)
</script>

<template>
  <AppDialog
    :visible="props.visible"
    :title="title"
    :description="descriptionHtml"
    size="lg"
    close-alignment="end"
    @close="onClose"
  >
    <ul class="space-y-4">
      <li
        v-for="account in props.accounts"
        :key="account.number"
        class="overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
      >
        <div class="flex w-full flex-col items-stretch sm:flex-row sm:items-stretch">
          <div class="flex flex-1 items-start gap-3 bg-roadshop-highlight/40 p-4">
            <div
              v-if="getIconForBank(account.bank)"
              class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow"
            >
              <img :src="getIconForBank(account.bank)" :alt="account.bank" class="h-7 w-7" />
            </div>
            <div>
              <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <p class="text-base font-semibold text-roadshop-primary">{{ account.bank }}</p>
                <p class="text-xs text-slate-500">{{ account.holder }}</p>
              </div>
              <div class="relative mt-1">
                <button
                  type="button"
                  class="group inline-flex items-center gap-1 font-mono text-sm text-roadshop-primary underline underline-offset-4"
                  @click="copyAccountNumber(account)"
                  @mouseenter="setHoverState(account.number, 'number', true)"
                  @mouseleave="setHoverState(account.number, 'number', false)"
                  @focus="setHoverState(account.number, 'number', true)"
                  @blur="setHoverState(account.number, 'number', false)"
                >
                  <span>{{ account.number }}</span>
                  <span
                    class="icon-wrapper flex h-3 w-3 items-center justify-center transition"
                    :class="
                      isCopied(account.number, 'number')
                        ? 'text-emerald-500 group-hover:text-emerald-500'
                        : 'text-roadshop-primary group-hover:text-roadshop-primary'
                    "
                    aria-hidden="true"
                    v-html="isCopied(account.number, 'number') ? successIcon : clipboardIcon"
                  ></span>
                </button>
                <TooltipBubble
                  :visible="isTooltipVisible(account.number, 'number')"
                  :message="getTooltipMessage(account.number, 'number')"
                  :variant="getTooltipVariant(account.number, 'number')"
                />
              </div>
            </div>
          </div>
          <div class="relative flex sm:w-auto">
            <button
              type="button"
              :class="[
                'flex h-full min-h-[45px] w-full items-center justify-center gap-2 px-5 text-sm font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:min-w-[64px]',
                isCopied(account.number, 'all')
                  ? 'bg-emerald-500 hover:bg-emerald-500 focus-visible:outline-emerald-500'
                  : 'bg-roadshop-primary hover:bg-roadshop-primary/90 focus-visible:outline-roadshop-primary',
              ]"
              :aria-label="copyAllLabel"
              @click="copyTransferDetails(account)"
              @mouseenter="setHoverState(account.number, 'all', true)"
              @mouseleave="setHoverState(account.number, 'all', false)"
              @focus="setHoverState(account.number, 'all', true)"
              @blur="setHoverState(account.number, 'all', false)"
            >
              <span class="flex items-center gap-2 sm:hidden">
                <span class="text-sm font-semibold text-white">
                  {{ isCopied(account.number, 'all') ? copiedAllButtonLabel : copyAllButtonLabel }}
                </span>
                <span
                  v-if="isCopied(account.number, 'all')"
                  class="icon-wrapper h-4 w-4 text-white"
                  aria-hidden="true"
                  v-html="successIcon"
                ></span>
              </span>
              <span
                class="icon-wrapper hidden h-4 w-4 items-center justify-center text-white sm:flex"
                aria-hidden="true"
                v-html="isCopied(account.number, 'all') ? successIcon : clipboardIcon"
              ></span>
            </button>
            <TooltipBubble
              :visible="isTooltipVisible(account.number, 'all')"
              :message="getTooltipMessage(account.number, 'all')"
              :variant="getTooltipVariant(account.number, 'all')"
            />
          </div>
        </div>
      </li>
    </ul>
  </AppDialog>
</template>

<style scoped>
.icon-wrapper :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
