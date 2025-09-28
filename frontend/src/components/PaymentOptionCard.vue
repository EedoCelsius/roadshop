<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

import { useI18nStore } from '../stores/i18n'

interface Props {
  name: string
  description: string
  provider: string
  status: 'available' | 'coming-soon'
  cta?: string
  url?: string
  icons?: Array<{
    src: string
    alt: string
  }>
}

const props = defineProps<Props>()

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
    class="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
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
              loading="lazy"
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

    <p class="flex-1 text-sm leading-relaxed text-slate-600">
      {{ props.description }}
    </p>

    <template v-if="props.status === 'available' && props.cta">
      <a
        :href="props.url"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center justify-center gap-2 rounded-full bg-roadshop-accent px-4 py-2 text-sm font-semibold text-white shadow-inner transition hover:bg-emerald-500"
      >
        {{ props.cta }}
        <span aria-hidden="true">→</span>
      </a>
    </template>
    <template v-else>
      <p class="text-xs text-slate-400">{{ preparingCopy }}</p>
    </template>
  </article>
</template>

<style scoped>
.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
