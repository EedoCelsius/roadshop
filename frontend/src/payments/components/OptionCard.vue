<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import Card from 'primevue/card'
import Chip from 'primevue/chip'
import Message from 'primevue/message'
import Tag from 'primevue/tag'

import { useI18nStore } from '@/localization/store'
import type { PaymentCurrency } from '@/payments/types'

interface Props {
  name: string
  description: string
  supportedCurrencies: string[]
  provider: string
  status: 'available' | 'coming-soon'
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

const statusMeta = computed(() => ({
  available: {
    label: i18nStore.t('status.available'),
    severity: 'success' as const,
  },
  'coming-soon': {
    label: i18nStore.t('status.comingSoon'),
    severity: 'warn' as const,
  },
}))

const preparingCopy = computed(() => i18nStore.t('card.preparing'))
const selectCurrencyPrompt = computed(() => i18nStore.t('card.selectCurrencyPrompt'))

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

const cardClasses = computed(
  () =>
    [
      'group cursor-pointer border border-slate-200 bg-white/80 transition-all duration-150 rounded-2xl',
      props.isSelected
        ? 'ring-2 ring-roadshop-accent shadow-lg'
        : 'shadow-sm hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-roadshop-accent',
    ].join(' '),
)
</script>

<template>
  <Card
    :pt="{ root: { class: cardClasses }, body: { class: 'flex flex-col gap-4 p-6 backdrop-blur' } }"
    role="button"
    tabindex="0"
    @click="emit('select')"
    @keydown.enter.prevent="emit('select')"
    @keydown.space.prevent="emit('select')"
  >
    <template #header>
      <div class="flex items-start justify-between gap-4 px-6 pt-6">
        <div class="flex flex-1 items-start gap-4">
          <div
            v-if="props.icons?.length"
            class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-roadshop-highlight/60 shadow-inner"
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
            <h3 class="text-xl font-semibold text-roadshop-primary">{{ props.name }}</h3>
            <p class="text-sm text-slate-500">{{ props.provider }}</p>
          </div>
        </div>
        <Tag :value="statusMeta[props.status].label" :severity="statusMeta[props.status].severity" rounded />
      </div>
    </template>

    <template #content>
      <div class="flex flex-col gap-4">
        <div v-if="props.currency !== 'KRW' && props.supportedCurrencies.length" class="flex flex-wrap gap-2">
          <Chip
            v-for="currency in props.supportedCurrencies"
            :key="currency"
            :label="currency"
            class="!bg-roadshop-highlight/70 !text-roadshop-primary !font-semibold"
          />
        </div>

        <p class="text-sm leading-relaxed text-slate-600">
          {{ props.description }}
        </p>

        <Message
          v-if="props.status === 'available' && props.isSelected && props.supportedCurrencies.length > 1"
          severity="info"
          :closable="false"
          class="!border-roadshop-accent/40 !bg-roadshop-highlight/60 !text-roadshop-accent"
        >
          {{ selectCurrencyPrompt }}
        </Message>

        <Message
          v-else-if="props.status !== 'available'"
          severity="warn"
          :closable="false"
          class="!text-amber-700"
        >
          {{ preparingCopy }}
        </Message>
      </div>
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
