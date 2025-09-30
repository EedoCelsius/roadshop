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

const formatLocaleLabel = (option: { label: string; nativeLabel: string }) =>
  option.label === option.nativeLabel ? option.label : `${option.label} · ${option.nativeLabel}`

const onLocaleChange = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  await i18nStore.setLocale(target.value as Locale)
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
          <label
            class="relative flex cursor-pointer items-center gap-3 rounded-full border border-roadshop-primary/10 bg-white/70 px-4 py-2 text-xs font-semibold text-roadshop-primary shadow-sm backdrop-blur"
          >
            <i aria-hidden="true" class="pi pi-globe text-base text-roadshop-accent"></i>
            <select
              class="min-w-[8rem] appearance-none cursor-pointer bg-transparent pr-8 text-sm font-medium text-roadshop-primary focus:outline-none"
              :value="locale"
              @change="onLocaleChange"
            >
              <option v-for="option in availableLocales" :key="option.code" :value="option.code">
                {{ formatLocaleLabel(option) }}
              </option>
            </select>
            <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <span class="block h-0 w-0 border-x-[5px] border-x-transparent border-t-[6px] border-t-roadshop-primary"></span>
            </span>
          </label>
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
