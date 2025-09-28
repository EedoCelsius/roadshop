<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, watch } from 'vue'
import { storeToRefs } from 'pinia'

import { useI18nStore } from '@/stores/i18n'

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
const copiedLabel = computed(() => i18nStore.t('transferPopup.copied'))
const closeLabel = computed(() => i18nStore.t('transferPopup.close'))

const getIconForBank = (bank: string) => firmIconMap[bank] ?? null

type CopyStatus = 'all' | 'number' | null

const copyStates = reactive<Record<string, CopyStatus>>({})
const copyTimers = new Map<string, number>()

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
  const payload = `${account.bank} ${account.number} ${account.holder}, ${amountText}`
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
              <button
                type="button"
                class="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                @click="onClose"
              >
                <span class="sr-only">{{ closeLabel }}</span>
                <span aria-hidden="true" class="text-lg">×</span>
              </button>
            </header>
            <ul class="mt-6 space-y-4">
              <li
                v-for="account in props.accounts"
                :key="account.number"
                class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-roadshop-highlight/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div class="flex items-start gap-3">
                  <div
                    v-if="getIconForBank(account.bank)"
                    class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white shadow"
                  >
                    <img :src="getIconForBank(account.bank)" :alt="account.bank" class="h-7 w-7" />
                  </div>
                  <div>
                    <p class="text-base font-semibold text-roadshop-primary">{{ account.bank }}</p>
                    <p class="text-sm font-mono text-slate-700">{{ account.number }}</p>
                    <p class="text-xs text-slate-500">{{ account.holder }}</p>
                  </div>
                </div>
                <div class="flex flex-col items-start gap-1 text-sm font-semibold text-roadshop-primary sm:items-end">
                  <button
                    type="button"
                    class="text-roadshop-primary underline decoration-roadshop-primary decoration-2 underline-offset-4 transition hover:text-roadshop-primary/90"
                    @click="handleCopyAll(account)"
                  >
                    {{ copyAllLabel }}
                  </button>
                  <button
                    type="button"
                    class="text-roadshop-primary underline decoration-roadshop-primary decoration-2 underline-offset-4 transition hover:text-roadshop-primary/90"
                    @click="handleCopyNumber(account)"
                  >
                    {{ copyNumberLabel }}
                  </button>
                  <p
                    v-if="copyStates[account.number]"
                    class="text-xs font-medium text-emerald-600"
                  >
                    {{ copiedLabel }}
                  </p>
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
</style>
