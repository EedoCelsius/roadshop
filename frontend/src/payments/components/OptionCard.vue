<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { useI18nStore } from '@/localization/store'
import type { PaymentCurrency } from '@/payments/types'

type StatusType = 'available' | 'coming-soon'

interface Props {
  name: string
  description: string
  supportedCurrencies: string[]
  provider: string
  status: StatusType
  icons?: Array<{
    src: string
    alt: string
  }>
  isSelected?: boolean
  currency: PaymentCurrency
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: []
}>()

const i18nStore = useI18nStore()

const statusMeta = computed<Record<StatusType, { label: string; severity: 'success' | 'warning' }>>(() => ({
  available: {
    label: i18nStore.t('status.available'),
    severity: 'success',
  },
  'coming-soon': {
    label: i18nStore.t('status.comingSoon'),
    severity: 'warning',
  },
}))

const preparingCopy = computed(() => i18nStore.t('card.preparing'))
const selectCurrencyPrompt = computed(() => i18nStore.t('card.selectCurrencyPrompt'))

const cardPt = computed(() => ({
  root: {
    class: [
      'group flex cursor-pointer flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm backdrop-blur transition',
      props.isSelected
        ? 'ring-2 ring-roadshop-accent ring-offset-2 ring-offset-white'
        : 'hover:-translate-y-1 hover:shadow-lg',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-roadshop-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white',
    ].join(' '),
    tabindex: 0,
    role: 'button',
  },
  body: {
    class: 'flex flex-col gap-4 p-0',
  },
}))

const activeIconIndex = ref(0)

let rotationTimer: ReturnType<typeof setInterval> | undefined

const stopRotation = () => {
  if (rotationTimer) {
    clearInterval(rotationTimer)
    rotationTimer = undefined
  }
}

watch(
  () => props.icons,
  (icons) => {
    activeIconIndex.value = 0
    stopRotation()

    if (icons && icons.length > 1) {
      rotationTimer = setInterval(() => {
        activeIconIndex.value = (activeIconIndex.value + 1) % icons.length
      }, 3000)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopRotation()
})
</script>

<template>
  <Card
    :pt="cardPt"
    @click="emit('select')"
    @keydown.enter.prevent="emit('select')"
    @keydown.space.prevent="emit('select')"
  >
    <template #content>
      <div class="flex items-start justify-between gap-4">
        <div class="flex flex-1 items-start gap-4">
          <div
            v-if="props.icons?.length"
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 shadow-inner"
          >
            <div class="icon-wrapper">
              <img
                v-for="(icon, index) in props.icons"
                :key="icon.src"
                :src="icon.src"
                :alt="index === activeIconIndex ? icon.alt : ''"
                :aria-hidden="index === activeIconIndex ? 'false' : 'true'"
                class="icon-image"
                :class="index === activeIconIndex ? 'icon-visible' : 'icon-hidden'"
              >
            </div>
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-roadshop-primary">
              {{ props.name }}
            </h3>
            <p class="text-sm text-slate-500">{{ props.provider }}</p>
          </div>
        </div>
        <Tag
          :value="statusMeta[props.status].label"
          :severity="statusMeta[props.status].severity"
          :pt="{ root: { class: 'rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide' } }"
        />
      </div>

      <div
        v-if="props.currency !== 'KRW' && props.supportedCurrencies.length"
        class="flex flex-wrap gap-2 text-xs text-roadshop-primary"
      >
        <Chip
          v-for="currency in props.supportedCurrencies"
          :key="currency"
          :label="currency"
          :pt="{
            root: {
              class: 'rounded-full border border-roadshop-primary/20 bg-roadshop-highlight/60 px-3 py-1 text-roadshop-primary font-semibold text-xs',
            },
            label: { class: 'text-roadshop-primary font-semibold' },
          }"
        />
      </div>

      <p class="flex-1 text-sm leading-relaxed text-slate-600">
        {{ props.description }}
      </p>

      <template v-if="props.status === 'available'">
        <p
          v-if="props.isSelected && props.supportedCurrencies.length > 1"
          class="text-xs text-roadshop-accent"
        >
          {{ selectCurrencyPrompt }}
        </p>
      </template>
      <template v-else>
        <p class="text-xs text-slate-400">{{ preparingCopy }}</p>
      </template>
    </template>
  </Card>
</template>

<style scoped>
.icon-wrapper {
  position: relative;
  height: 1.5rem;
  width: 1.5rem;
}

.icon-image {
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.icon-visible {
  opacity: 1;
  transform: translateY(0);
}

.icon-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
}
</style>
