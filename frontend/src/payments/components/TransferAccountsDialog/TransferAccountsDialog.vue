<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useI18nStore } from '@/localization/store'
import type { TransferAccount } from '@/payments/services/paymentInfoService'
import { useTransferCopyState } from './useTransferCopyState'

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

const { isCopied, handleCopyAll, handleCopyNumber, reset } = useTransferCopyState()

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
const copyNumberLabel = computed(() => i18nStore.t('transferPopup.copyNumber'))
const copiedNumberLabel = computed(() => i18nStore.t('transferPopup.copiedNumber'))
const copyAllButtonLabel = computed(() => i18nStore.t('transferPopup.copyAllButton'))
const copiedAllButtonLabel = computed(() => i18nStore.t('transferPopup.copiedAllButton'))
const closeLabel = computed(() => i18nStore.t('dialog.close'))

const getIconForBank = (bank: string) => firmIconMap[bank] ?? null

const copyTransferDetails = async (account: TransferAccount) => {
  const amountText = `${formattedAmountForCopy.value}원`
  const payload = `${account.bank} ${account.number} ${account.holder} [${amountText}]`
  await handleCopyAll(account.number, payload)
}

const copyAccountNumber = async (account: TransferAccount) => {
  await handleCopyNumber(account.number)
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
  <Dialog
    :visible="props.visible"
    modal
    dismissable-mask
    close-on-escape
    :header="title"
    :style="{ width: 'min(92vw, 38rem)' }"
    :pt="{
      root: { class: 'rounded-3xl border-0 bg-white/95 shadow-xl backdrop-blur-sm' },
      mask: { class: 'bg-slate-900/40 backdrop-blur-sm' },
      header: { class: 'text-roadshop-primary font-semibold text-lg' },
      content: { class: 'text-slate-600' },
      footer: { class: 'flex justify-end gap-2' },
    }"
    @update:visible="(value) => {
      if (!value) {
        onClose()
      }
    }"
  >
    <p class="text-sm leading-relaxed text-slate-600" v-html="descriptionHtml"></p>
    <div class="mt-6 space-y-4">
      <Card
        v-for="account in props.accounts"
        :key="account.number"
        :pt="{
          root: { class: 'rounded-2xl border border-slate-200 bg-roadshop-highlight/40 shadow-sm' },
          body: { class: 'p-5' },
        }"
      >
        <template #content>
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div class="flex flex-1 items-start gap-3">
              <div
                v-if="getIconForBank(account.bank)"
                class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow"
              >
                <img :src="getIconForBank(account.bank)" :alt="account.bank" class="h-7 w-7" />
              </div>
              <div class="flex-1">
                <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  <p class="text-base font-semibold text-roadshop-primary">{{ account.bank }}</p>
                  <Tag
                    :value="account.holder"
                    severity="secondary"
                    :pt="{ root: { class: 'bg-white text-roadshop-primary/80 border border-roadshop-primary/20 text-xs' } }"
                  />
                </div>
                <Button
                  type="button"
                  class="mt-3 inline-flex items-center gap-1 font-mono text-sm text-roadshop-primary"
                  text
                  :label="account.number"
                  :icon="isCopied(account.number, 'number') ? 'pi pi-check' : 'pi pi-copy'"
                  icon-pos="right"
                  v-tooltip.top="isCopied(account.number, 'number') ? copiedNumberLabel : copyNumberLabel"
                  @click="copyAccountNumber(account)"
                />
              </div>
            </div>
            <Button
              type="button"
              class="w-full sm:w-auto"
              :label="isCopied(account.number, 'all') ? copiedAllButtonLabel : copyAllButtonLabel"
              :icon="isCopied(account.number, 'all') ? 'pi pi-check' : 'pi pi-copy'"
              icon-pos="right"
              :severity="isCopied(account.number, 'all') ? 'success' : 'primary'"
              @click="copyTransferDetails(account)"
            />
          </div>
        </template>
      </Card>
    </div>
    <template #footer>
      <Button type="button" :label="closeLabel" text severity="secondary" @click="onClose" />
    </template>
  </Dialog>
</template>
