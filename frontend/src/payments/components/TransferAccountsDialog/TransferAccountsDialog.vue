<script setup lang="ts">
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'

import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import { useToast } from 'primevue/usetoast'

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

const toast = useToast()

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
const copyAllLabel = computed(() => i18nStore.t('transferPopup.copyAll'))

const dialogVisibility = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  },
})

const getIconForBank = (bank: string) => firmIconMap[bank] ?? null

const copyTransferDetails = async (account: TransferAccount) => {
  const amountText = `${formattedAmountForCopy.value}원`
  const payload = `${account.bank} ${account.number} ${account.holder} [${amountText}]`
  const success = await handleCopyAll(account.number, payload)

  if (success) {
    toast.add({
      severity: 'success',
      summary: copiedAllButtonLabel.value,
      detail: `${account.bank} · ${account.number}`,
      life: 2000,
    })
  }
}

const copyAccountNumber = async (account: TransferAccount) => {
  const success = await handleCopyNumber(account.number)

  if (success) {
    toast.add({
      severity: 'info',
      summary: copiedNumberLabel.value,
      detail: account.number,
      life: 2000,
    })
  }
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
    v-model:visible="dialogVisibility"
    modal
    :header="title"
    :style="{ width: '38rem' }"
    :dismissableMask="true"
    content-class="rounded-3xl"
  >
    <p class="mb-5 text-sm leading-relaxed text-slate-600" v-html="descriptionHtml"></p>
    <div class="flex flex-col gap-4">
      <Card
        v-for="account in props.accounts"
        :key="account.number"
        :pt="{ root: { class: 'rounded-2xl border border-slate-200 shadow-sm overflow-hidden' }, body: { class: 'p-0' } }"
      >
        <template #content>
          <div class="flex flex-col sm:flex-row">
            <div class="flex flex-1 flex-col gap-3 bg-roadshop-highlight/40 p-5">
              <div class="flex items-start gap-3">
                <Avatar
                  v-if="getIconForBank(account.bank)"
                  :image="getIconForBank(account.bank) ?? undefined"
                  :label="account.bank[0] ?? ''"
                  shape="circle"
                  class="!bg-white !text-roadshop-primary shadow"
                />
                <div class="flex flex-col gap-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-base font-semibold text-roadshop-primary">{{ account.bank }}</p>
                    <Tag
                      v-if="account.holder"
                      :value="account.holder"
                      severity="info"
                      class="!bg-white !text-roadshop-primary"
                      rounded
                    />
                  </div>
                  <Button
                    :label="account.number"
                    :icon="isCopied(account.number, 'number') ? 'pi pi-check' : 'pi pi-copy'"
                    iconPos="right"
                    text
                    class="!p-0 !text-roadshop-primary font-mono"
                    v-tooltip.bottom="isCopied(account.number, 'number') ? copiedNumberLabel : copyNumberLabel"
                    @click="copyAccountNumber(account)"
                  />
                </div>
              </div>
            </div>
            <div class="flex items-center justify-center border-t border-slate-200 p-5 sm:w-48 sm:border-l sm:border-t-0">
              <Button
                :label="isCopied(account.number, 'all') ? copiedAllButtonLabel : copyAllButtonLabel"
                :icon="isCopied(account.number, 'all') ? 'pi pi-check' : 'pi pi-copy'"
                :severity="isCopied(account.number, 'all') ? 'success' : 'primary'"
                class="w-full sm:w-auto"
                :aria-label="copyAllLabel"
                v-tooltip.left="copyAllLabel"
                @click="copyTransferDetails(account)"
              />
            </div>
          </div>
        </template>
      </Card>
    </div>
  </Dialog>
</template>
