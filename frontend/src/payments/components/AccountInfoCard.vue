<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  bankName: string
  accountNo: string
  accountHolder: string
}

const props = defineProps<Props>()

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
  <article class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-md">
    <div class="flex flex-col items-center gap-7 text-center">
      <div class="flex flex-col items-center gap-5">
        <div
          class="flex h-20 w-20 items-center justify-center rounded-3xl bg-roadshop-highlight/60 shadow-inner"
          aria-hidden="true"
        >
          <img v-if="bankIcon" :src="bankIcon" :alt="props.bankName" class="h-14 w-14" />
          <span v-else class="text-2xl font-semibold text-roadshop-primary">{{ bankMonogram }}</span>
        </div>
        <div>
          <p class="text-2xl font-semibold text-roadshop-primary">
            {{ props.bankName }}
            <span class="ml-2 text-lg font-medium text-roadshop-primary/80">({{ props.accountHolder }})</span>
          </p>
          <p class="mt-3 font-mono text-xl tracking-wider text-slate-700">{{ props.accountNo }}</p>
        </div>
      </div>
    </div>
  </article>
</template>
