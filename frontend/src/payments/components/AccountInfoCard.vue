<script setup lang="ts">
import { computed } from 'vue'

import { useI18nStore } from '@/localization/store'

interface Props {
  bankName: string
  accountNo: string
  accountHolder: string
}

const props = defineProps<Props>()

const i18nStore = useI18nStore()

const bankLabel = computed(() => i18nStore.t('accountInfo.bank'))
const accountLabel = computed(() => i18nStore.t('accountInfo.account'))
const holderLabel = computed(() => i18nStore.t('accountInfo.holder'))

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

const normalizedBankName = computed(() => props.bankName.trim())

const bankIcon = computed(() => {
  const direct = firmIconMap[normalizedBankName.value]
  if (direct) {
    return direct
  }

  const compact = normalizedBankName.value.replace(/\s+/g, '')
  return firmIconMap[compact] ?? null
})

const bankMonogram = computed(() => {
  const trimmed = normalizedBankName.value
  if (!trimmed) {
    return ''
  }

  const compact = trimmed.replace(/[^\p{L}\p{N}]/gu, '')
  const source = compact || trimmed
  const preview = source.slice(0, 2)

  return /[A-Za-z]/.test(preview) ? preview.toUpperCase() : preview
})

</script>

<template>
  <article class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-md">
    <div class="flex flex-col items-center gap-6">
      <div class="flex flex-col items-center gap-3 text-center">
        <div
          class="flex h-16 w-16 items-center justify-center rounded-2xl bg-roadshop-highlight/60 shadow-inner"
          aria-hidden="true"
        >
          <img v-if="bankIcon" :src="bankIcon" :alt="props.bankName" class="h-10 w-10" />
          <span v-else class="text-lg font-semibold text-roadshop-primary">{{ bankMonogram }}</span>
        </div>
        <div>
          <p class="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{{ bankLabel }}</p>
          <p class="mt-1 text-lg font-semibold text-roadshop-primary">{{ props.bankName }}</p>
        </div>
      </div>

      <div class="grid w-full gap-3 sm:grid-cols-2">
        <div class="p-4 text-center sm:text-left">
          <p class="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
            {{ accountLabel }}
          </p>
          <p class="mt-2 font-mono text-lg text-roadshop-primary">{{ props.accountNo }}</p>
        </div>
        <div class="p-4 text-center sm:text-left">
          <p class="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500">
            {{ holderLabel }}
          </p>
          <p class="mt-2 text-lg font-semibold text-roadshop-primary">{{ props.accountHolder }}</p>
        </div>
      </div>
    </div>
  </article>
</template>
