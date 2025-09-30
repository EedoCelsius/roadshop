<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { useI18nStore } from '@/localization/store'
import type { PaymentCurrency } from '@/payments/types'

import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Chip from 'primevue/chip'
import InlineMessage from 'primevue/inlinemessage'
import Avatar from 'primevue/avatar'

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
    severity: 'warning' as const,
  },
}))

const preparingCopy = computed(() => i18nStore.t('card.preparing'))
const selectCurrencyPrompt = computed(() => i18nStore.t('card.selectCurrencyPrompt'))

const activeIconIndex = ref(0)

const activeIcon = computed(() => props.icons?.[activeIconIndex.value])

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

const cardPt = computed(() => ({
  root: {
    class: [
      'h-full border-round-2xl surface-card transition-all transition-duration-200 shadow-1',
      props.isSelected ? 'border-2 border-primary shadow-4' : 'border-1 border-transparent',
    ],
  },
  body: {
    class: 'flex flex-column gap-4 h-full',
  },
}))

const onSelect = () => {
  emit('select')
}
</script>

<template>
  <div
    class="card-trigger h-full border-round-2xl cursor-pointer outline-none"
    role="button"
    tabindex="0"
    v-ripple
    @click="onSelect"
    @keydown.enter.prevent="onSelect"
    @keydown.space.prevent="onSelect"
  >
    <Card :pt="cardPt">
      <template #content>
        <div class="flex flex-column gap-4 h-full">
          <div class="flex align-items-start justify-content-between gap-3">
            <div class="flex align-items-start gap-3">
              <Avatar
                v-if="activeIcon"
                shape="circle"
                size="large"
                class="shadow-2"
                :image="activeIcon.src"
                :label="activeIcon.alt"
                :pt="{ image: { alt: activeIcon.alt } }"
              />
              <div class="flex flex-column gap-1">
                <span class="text-xl font-semibold text-primary">{{ props.name }}</span>
                <small class="text-color-secondary">{{ props.provider }}</small>
              </div>
            </div>
            <Tag :value="statusMeta[props.status].label" :severity="statusMeta[props.status].severity" />
          </div>

          <div v-if="props.currency !== 'KRW' && props.supportedCurrencies.length" class="flex flex-wrap gap-2">
            <Chip
              v-for="currency in props.supportedCurrencies"
              :key="currency"
              :label="currency"
              class="surface-100 text-primary font-semibold"
            />
          </div>

          <p class="m-0 flex-1 text-sm line-height-3 text-color-secondary">
            {{ props.description }}
          </p>

          <InlineMessage
            v-if="props.status === 'available' && props.isSelected && props.supportedCurrencies.length > 1"
            severity="info"
            class="w-full"
          >
            {{ selectCurrencyPrompt }}
          </InlineMessage>
          <InlineMessage v-else-if="props.status === 'coming-soon'" severity="warn" class="w-full">
            {{ preparingCopy }}
          </InlineMessage>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.card-trigger:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}
</style>
