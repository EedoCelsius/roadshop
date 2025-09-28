<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { useI18nStore } from '../stores/i18n'

interface Props {
  name: string
  description: string
  supportedCurrencies: string[]
  provider: string
  status: 'available' | 'coming-soon'
  cta?: string
  url?: string
  icons?: Array<{
    src: string
    alt: string
  }>
  isSelected?: boolean
  selectedCurrency?: string | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: []
}>()

const i18nStore = useI18nStore()

const statusMeta = computed(() => ({
  available: {
    label: i18nStore.t('status.available'),
    classes: 'bg-green-100 text-green-700',
  },
  'coming-soon': {
    label: i18nStore.t('status.comingSoon'),
    classes: 'bg-amber-100 text-amber-700',
  },
}))

const preparingCopy = computed(() => i18nStore.t('card.preparing'))
const selectedCurrencyCopy = computed(() =>
  props.selectedCurrency
    ? i18nStore.t('card.selectedCurrency').replace('{currency}', props.selectedCurrency)
    : null,
)
const selectCurrencyPrompt = computed(() => i18nStore.t('card.selectCurrencyPrompt'))

const activeIconIndex = ref(0)

const activeIcon = computed(() => {
  if (!props.icons?.length) {
    return null
  }

  const normalizedIndex = activeIconIndex.value % props.icons.length

  return props.icons[normalizedIndex]
})

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
  { immediate: true }
)

onBeforeUnmount(() => {
  stopRotation()
})
</script>

<template>
  <article
    class="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg focus:outline-none cursor-pointer"
    :class="props.isSelected ? 'ring-2 ring-roadshop-accent' : ''"
    role="button"
    tabindex="0"
    @click="emit('select')"
    @keydown.enter.prevent="emit('select')"
    @keydown.space.prevent="emit('select')"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex flex-1 items-start gap-4">
        <div v-if="activeIcon" class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 shadow-inner">
          <Transition name="icon-fade" mode="out-in">
            <img
              :key="activeIcon.src"
              :src="activeIcon.src"
              :alt="activeIcon.alt"
              class="h-6 w-6"
            >
          </Transition>
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-roadshop-primary">
            {{ props.name }}
          </h3>
          <p class="text-sm text-slate-500">{{ props.provider }}</p>
        </div>
      </div>
      <span
        class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
        :class="statusMeta[props.status].classes"
      >
        {{ statusMeta[props.status].label }}
      </span>
    </div>

    <div v-if="props.supportedCurrencies.length" class="flex flex-wrap gap-2 text-xs text-roadshop-primary">
      <span
        v-for="currency in props.supportedCurrencies"
        :key="currency"
        class="inline-flex items-center gap-1 rounded-full border border-roadshop-primary/20 bg-roadshop-highlight/60 px-3 py-1 font-semibold"
      >
        {{ currency }}
      </span>
    </div>

    <p
      v-if="props.isSelected && selectedCurrencyCopy"
      class="text-xs font-semibold text-roadshop-accent"
    >
      {{ selectedCurrencyCopy }}
    </p>

    <p class="flex-1 text-sm leading-relaxed text-slate-600">
      {{ props.description }}
    </p>

    <template v-if="props.status === 'available'">
      <a
        v-if="props.cta && props.url"
        :href="props.url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center gap-2 rounded-full bg-roadshop-accent px-4 py-2 text-sm font-semibold text-white shadow-inner transition hover:bg-emerald-500"
      >
        {{ props.cta }}
        <span aria-hidden="true">→</span>
      </a>
      <p
        v-else-if="props.isSelected && props.supportedCurrencies.length > 1"
        class="text-xs text-roadshop-accent"
      >
        {{ selectCurrencyPrompt }}
      </p>
    </template>
    <template v-else>
      <p class="text-xs text-slate-400">{{ preparingCopy }}</p>
    </template>
  </article>
</template>

<style scoped>
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
