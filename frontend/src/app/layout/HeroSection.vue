<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import type { Locale } from '@/localization/store'
import { useI18nStore } from '@/localization/store'

import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import Divider from 'primevue/divider'

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

const languageOptions = computed(() =>
  availableLocales.value.map((option) => ({
    code: option.code,
    label: formatLocaleLabel(option),
  })),
)

const selectedLocaleCode = computed({
  get: () => locale.value,
  set: (value: Locale | null) => {
    if (value) {
      void i18nStore.setLocale(value)
    }
  },
})
</script>

<template>
  <header class="surface-section">
    <div class="mx-auto w-full max-w-6xl px-4 py-6 md:px-6 md:py-8">
      <Card class="shadow-2 border-round-3xl">
        <template #content>
          <div class="flex flex-column gap-4 md:gap-6">
            <div class="flex flex-column md:flex-row md:align-items-start md:justify-content-between gap-4">
              <div class="flex flex-column gap-2">
                <span class="text-xs font-semibold uppercase tracking-widest text-primary">
                  {{ heroCopy.kicker }}
                </span>
                <h1 class="m-0 text-4xl md:text-5xl font-bold text-primary">
                  {{ heroCopy.title }}
                </h1>
              </div>
              <div class="flex flex-column sm:flex-row align-items-start gap-3">
                <Tag icon="pi pi-bolt" severity="success" class="w-full sm:w-auto">
                  {{ heroCopy.badge }}
                </Tag>
                <div class="flex flex-column gap-1 w-full sm:w-auto">
                  <span class="text-xs font-semibold uppercase tracking-widest text-color-secondary">
                    {{ languageLabel }}
                  </span>
                  <Dropdown
                    v-model="selectedLocaleCode"
                    :options="languageOptions"
                    option-label="label"
                    option-value="code"
                    class="w-full sm:w-12rem"
                    :show-clear="false"
                  />
                </div>
              </div>
            </div>
            <p class="m-0 text-lg line-height-3 text-color-secondary">
              {{ heroCopy.description }}
            </p>
            <Divider class="hidden md:block" />
            <div class="grid">
              <div
                v-for="highlight in highlights"
                :key="highlight.title"
                class="col-12 md:col-4"
              >
                <Card class="h-full surface-50 border-none shadow-none">
                  <template #title>
                    <span class="text-lg font-semibold text-primary">{{ highlight.title }}</span>
                  </template>
                  <template #content>
                    <p class="m-0 text-sm text-color-secondary line-height-3">
                      {{ highlight.description }}
                    </p>
                  </template>
                </Card>
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </header>
</template>
