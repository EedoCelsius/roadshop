<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useI18nStore } from '@/stores/i18n'
import clipboardIcon from '@icons/ui/clipboard.svg?raw'
import successIcon from '@icons/ui/success.svg?raw'

import TooltipBubble from './TooltipBubble.vue'

interface TransferAccount {
  bank: string
  number: string
  holder: string
}

interface Props {
  visible: boolean
  amount: number
  accounts: TransferAccount[]
}

const props = defineProps<Props>()

const emit = defineEmits<{ close: [] }>()

const i18nStore = useI18nStore()
const { locale } = storeToRefs(i18nStore)

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
const closeLabel = computed(() => i18nStore.t('transferPopup.close'))

const getIconForBank = (bank: string) => firmIconMap[bank] ?? null

type CopyStatus = 'all' | 'number' | null

const copyStates = reactive<Record<string, CopyStatus>>({})
const copyTimers = new Map<string, number>()
const hoveredControl = ref<string | null>(null)

const controlKey = (accountNumber: string, action: Exclude<CopyStatus, null>) => `${accountNumber}:${action}`

const setHoveredControl = (accountNumber: string, action: Exclude<CopyStatus, null>, value: boolean) => {
  const key = controlKey(accountNumber, action)

  if (value) {
    hoveredControl.value = key
    return
  }

  if (hoveredControl.value === key) {
    hoveredControl.value = null
  }
}

const isCopied = (accountNumber: string, action: Exclude<CopyStatus, null>) => copyStates[accountNumber] === action

const isTooltipVisible = (accountNumber: string, action: Exclude<CopyStatus, null>) => {
  const key = controlKey(accountNumber, action)
  return hoveredControl.value === key || isCopied(accountNumber, action)
}

const getTooltipVariant = (accountNumber: string, action: Exclude<CopyStatus, null>) =>
  isCopied(accountNumber, action) ? 'success' : 'default'

const getTooltipMessage = (accountNumber: string, action: Exclude<CopyStatus, null>) => {
  if (isCopied(accountNumber, action)) {
    return action === 'all' ? copiedLabel.value : copiedNumberLabel.value
  }

  return action === 'all' ? copyTooltipLabel.value : copyNumberLabel.value
}

const resetCopyStates = () => {
  Object.keys(copyStates).forEach((key) => {
    delete copyStates[key]
  })
  if (typeof window !== 'undefined') {
    copyTimers.forEach((timeoutId) => {
      window.clearTimeout(timeoutId)
    })
  }
  copyTimers.clear()
  hoveredControl.value = null
}

const scheduleReset = (key: string) => {
  if (typeof window === 'undefined') {
    return
  }

  const previousTimer = copyTimers.get(key)
  if (previousTimer) {
    window.clearTimeout(previousTimer)
  }

  const timeoutId = window.setTimeout(() => {
    copyStates[key] = null
    copyTimers.delete(key)
  }, 2000)

  copyTimers.set(key, timeoutId)
}

const setCopyStatus = (key: string, status: Exclude<CopyStatus, null>) => {
  copyStates[key] = status
  scheduleReset(key)
}

const copyText = async (text: string) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Ignore clipboard errors and fall back
    }
  }

  if (typeof document === 'undefined') {
    return false
  }

  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'absolute'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()

  let success = false
  try {
    success = document.execCommand('copy')
  } catch {
    success = false
  } finally {
    document.body.removeChild(textarea)
  }

  return success
}

const handleCopyAll = async (account: TransferAccount) => {
  const amountText = `${formattedAmountForCopy.value}원`
  const payload = `${account.bank} ${account.number} ${account.holder} [${amountText}]`
  const success = await copyText(payload)

  if (success) {
    setCopyStatus(account.number, 'all')
  }
}

const handleCopyNumber = async (account: TransferAccount) => {
  const success = await copyText(account.number)

  if (success) {
    setCopyStatus(account.number, 'number')
  }
}

const onClose = () => {
  emit('close')
}

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetCopyStates()
    }
  },
)

onBeforeUnmount(() => {
  resetCopyStates()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div v-if="props.visible" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-slate-900/60" @click="onClose"></div>
        <div class="relative z-10 flex min-h-full items-center justify-center px-4 py-10">
          <div class="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <header class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-roadshop-primary">{{ title }}</h2>
                <p
                  class="mt-2 text-sm leading-relaxed text-slate-600"
                  v-html="descriptionHtml"
                ></p>
              </div>
            </header>
            <ul class="mt-6 space-y-4">
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
                          @click="handleCopyNumber(account)"
                          @mouseenter="setHoveredControl(account.number, 'number', true)"
                          @mouseleave="setHoveredControl(account.number, 'number', false)"
                          @focus="setHoveredControl(account.number, 'number', true)"
                          @blur="setHoveredControl(account.number, 'number', false)"
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
                      @click="handleCopyAll(account)"
                    >
                      <span class="flex items-center gap-1 sm:hidden">
                        <span
                          v-if="isCopied(account.number, 'all')"
                          class="icon-wrapper h-4 w-4 text-white"
                          aria-hidden="true"
                          v-html="successIcon"
                        ></span>
                        <span class="text-sm font-semibold text-white">
                          {{ isCopied(account.number, 'all') ? copiedAllButtonLabel : copyAllButtonLabel }}
                        </span>
                      </span>
                      <span
                        class="icon-wrapper hidden h-4 w-4 items-center justify-center text-white sm:flex"
                        aria-hidden="true"
                        v-html="isCopied(account.number, 'all') ? successIcon : clipboardIcon"
                      ></span>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
            <footer class="mt-6 flex justify-end">
              <button
                type="button"
                class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                @click="onClose"
              >
                {{ closeLabel }}
              </button>
            </footer>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.2s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}

.icon-wrapper :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
