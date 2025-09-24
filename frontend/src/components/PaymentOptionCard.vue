<script setup lang="ts">
import { computed } from 'vue'

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
</script>

<template>
  <article
    class="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="flex-1">
        <h3 class="text-xl font-semibold text-roadshop-primary">
          {{ props.name }}
        </h3>
        <p class="text-sm text-slate-500">{{ props.provider }}</p>
        <div
          v-if="props.icons?.length"
          class="mt-3 flex flex-wrap items-center gap-2"
        >
          <span
            v-for="icon in props.icons"
            :key="icon.src"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 shadow-inner"
          >
            <img
              :src="icon.src"
              :alt="icon.alt"
              class="h-5 w-5"
              loading="lazy"
            >
          </span>
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
