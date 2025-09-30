<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import type { Locale } from '@/localization/store'
import { useI18nStore } from '@/localization/store'

const i18nStore = useI18nStore()
const { locale, availableLocales } = storeToRefs(i18nStore)

const heroCopy = computed(() => ({
  kicker: i18nStore.t('hero.kicker'),
  title: i18nStore.t('hero.title'),
  badge: i18nStore.t('hero.badge'),
  description: i18nStore.t('hero.description'),
}))

const highlights = computed(() => [
  {
    title: i18nStore.t('highlights.instant.title'),
    description: i18nStore.t('highlights.instant.description'),
  },
  {
    title: i18nStore.t('highlights.guidance.title'),
    description: i18nStore.t('highlights.guidance.description'),
  },
  {
    title: i18nStore.t('highlights.coverage.title'),
    description: i18nStore.t('highlights.coverage.description'),
  },
])

const languageLabel = computed(() => i18nStore.t('language.label'))

const formatLocaleLabel = (option: { label: string; nativeLabel: string }) =>
  option.label === option.nativeLabel ? option.label : `${option.label} · ${option.nativeLabel}`

const localeOptions = computed(() =>
  availableLocales.value.map((option) => ({
    code: option.code,
    displayLabel: formatLocaleLabel(option),
  })),
)

const selectedLocale = computed({
  get: () => locale.value,
  set: (value: Locale | null) => {
    if (value && value !== locale.value) {
      void i18nStore.setLocale(value)
    }
  },
})

const dropdownPt = {
  root: {
    class:
      'w-full min-w-[10rem] rounded-full border-none bg-transparent shadow-none focus:outline-none focus:ring-0',
  },
  input: {
    class:
      'w-full rounded-full border-none bg-transparent px-0 text-sm font-medium text-roadshop-primary focus:outline-none focus:ring-0',
  },
  trigger: {
    class: 'text-roadshop-primary',
  },
  panel: {
    class: 'rounded-2xl border border-roadshop-primary/10 shadow-xl backdrop-blur-sm',
  },
  item: {
    class:
      'px-4 py-2 text-sm text-roadshop-primary transition hover:bg-roadshop-highlight/60 focus-visible:outline-none',
  },
}
</script>

<template>
  <header class="mx-auto w-full max-w-5xl px-6 pt-16">
    <div class="flex flex-col gap-8 rounded-3xl bg-white/80 p-10 shadow-lg backdrop-blur">
      <div class="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.2em] text-roadshop-accent">
            {{ heroCopy.kicker }}
          </p>
          <h1 class="mt-3 text-4xl font-bold text-roadshop-primary md:text-5xl">
            {{ heroCopy.title }}
          </h1>
        </div>
        <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <div class="flex items-center gap-3 rounded-full bg-roadshop-primary px-4 py-2 text-sm text-white shadow">
            <span class="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>{{ heroCopy.badge }}</span>
          </div>
          <div
            class="flex items-center gap-3 rounded-full border border-roadshop-primary/10 bg-white/70 px-4 py-2 text-xs font-semibold text-roadshop-primary shadow-sm backdrop-blur"
          >
            <span class="tracking-[0.2em] text-roadshop-accent">{{ languageLabel }}</span>
            <Dropdown
              v-model="selectedLocale"
              :options="localeOptions"
              option-label="displayLabel"
              option-value="code"
              :pt="dropdownPt"
            />
          </div>
        </div>
      </div>
      <p class="max-w-3xl text-lg leading-relaxed text-slate-600">
        {{ heroCopy.description }}
      </p>
      <div class="grid gap-4 text-sm text-slate-500 md:grid-cols-3">
        <div
          v-for="highlight in highlights"
          :key="highlight.title"
          class="rounded-2xl bg-roadshop-highlight/80 p-4"
        >
          <p class="font-semibold text-roadshop-primary">{{ highlight.title }}</p>
          <p>{{ highlight.description }}</p>
        </div>
      </div>
    </div>
  </header>
</template>
