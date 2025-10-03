<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useI18nStore } from '@/localization/store'
import type { TransferAccount } from '@/payments/services/paymentInfoService'
import TooltipBubble from '@/shared/components/TooltipBubble.vue'
import DialogCloseFull from '@/shared/components/DialogCloseFull.vue'
import { getFirmIcon } from '@icons/firms'
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

const formattedAmount = computed(() =>
  props.amount
    .toLocaleString(locale.value || 'en', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    })
    .replace(/\u00A0/g, ' '),
)

const title = computed(() => i18nStore.t('dialogs.transferAccounts.title'))
const descriptionHtml = computed(() =>
  i18nStore
    .t('dialogs.transferAccounts.description')
    .replace(
      '{amount}',
      `<strong class="font-semibold text-roadshop-primary">${formattedAmount.value}</strong>`,
    ),
)
const copyAllLabel = computed(() => i18nStore.t('dialogs.transferAccounts.copy.all'))
const copyNumberLabel = computed(() => i18nStore.t('dialogs.transferAccounts.copy.accountNo'))
const copiedAllLabel = computed(() => i18nStore.t('dialogs.transferAccounts.copied.all'))
const copiedNumberLabel = computed(() => i18nStore.t('dialogs.transferAccounts.copied.accountNo'))

const getIconForBank = (bank: string) => getFirmIcon(bank)

const copyTransferDetails = async (account: TransferAccount) => {
  const amountText = formattedAmount.value
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
  <DialogCloseFull
    :visible="props.visible"
    :title="title"
    :description="descriptionHtml"
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
                  class="group inline-flex items-center gap-1 font-mono text-sm text-roadshop-primary"
                  @click="copyAccountNumber(account)"
                  @mouseenter="setHoverState(account.number, 'number', true)"
                  @mouseleave="setHoverState(account.number, 'number', false)"
                  @focus="setHoverState(account.number, 'number', true)"
                  @blur="setHoverState(account.number, 'number', false)"
                >
                  <span class="underline underline-offset-4">{{ account.number }}</span>
                  <i
                    aria-hidden="true"
                    class="pi text-xs transition"
                    :class="
                      isCopied(account.number, 'number')
                        ? ['pi-check', 'text-emerald-500', 'group-hover:text-emerald-500']
                        : ['pi-copy', 'text-roadshop-primary', 'group-hover:text-roadshop-primary']
                    "
                  ></i>
                </button>
                <TooltipBubble
                  :visible="isTooltipVisible(account.number, 'number')"
                  :message="isCopied(account.number, 'number') ? copiedNumberLabel : copyNumberLabel"
                  :variant="isCopied(account.number, 'number') ? 'success' : 'default'"
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
            >
              <span class="flex items-center gap-2 sm:hidden">
                <span class="font-semibold text-white">
                  {{ isCopied(account.number, 'all') ? copiedAllLabel : copyAllLabel }}
                </span>
                <i
                  v-if="isCopied(account.number, 'all')"
                  aria-hidden="true"
                  class="pi pi-check text-white"
                ></i>
              </span>
              <i
                aria-hidden="true"
                class="pi hidden text-lg text-white sm:flex"
                :class="isCopied(account.number, 'all') ? 'pi-check' : 'pi-clipboard'"
              ></i>
            </button>
          </div>
        </div>
      </li>
    </ul>
  </DialogCloseFull>
</template>

<style scoped>
.pi {
  line-height: 1;
}
</style>
