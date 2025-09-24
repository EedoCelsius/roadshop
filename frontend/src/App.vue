<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import PaymentOptionCard from './components/PaymentOptionCard.vue'
import { getPaymentLayoutConfig } from './config/paymentLayout'
import { usePaymentStore } from './stores/payment'
import { type Locale, useI18nStore } from './stores/i18n'

const paymentStore = usePaymentStore()
const { methodsByCurrency } = storeToRefs(paymentStore)

const i18nStore = useI18nStore()
const { locale, availableLocales } = storeToRefs(i18nStore)

const localizedSections = computed(() => {
  const layoutConfig = getPaymentLayoutConfig(locale.value)

  return layoutConfig.sectionOrder.map((currency) => {
    const methods = [...methodsByCurrency.value[currency]]
    const orderedIds = layoutConfig.methodOrder?.[currency]

    if (orderedIds) {
      const fallbackIndex = Number.MAX_SAFE_INTEGER
      methods.sort((a, b) => {
        const aIndex = orderedIds.indexOf(a.id)
        const bIndex = orderedIds.indexOf(b.id)

        return (aIndex === -1 ? fallbackIndex : aIndex) - (bIndex === -1 ? fallbackIndex : bIndex)
      })
    }

    return {
      currency,
      methods: methods.map((method) => ({
        ...method,
        description: i18nStore.t(`payment.${method.id}.description`, method.description),
        cta: method.cta ? i18nStore.t(`payment.${method.id}.cta`, method.cta) : undefined,
        provider: i18nStore.t(`payment.${method.id}.provider`, method.provider),
      })),
    }
  })
})

const currentYear = new Date().getFullYear().toString()

const footerCopy = computed(() => i18nStore.t('footer.message').replace('{year}', currentYear))

const formatLocaleLabel = (option: { label: string; nativeLabel: string }) =>
  option.label === option.nativeLabel ? option.label : `${option.label} · ${option.nativeLabel}`

const onLocaleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  i18nStore.setLocale(target.value as Locale)
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gradient-to-b from-white via-roadshop-highlight to-white">
    <header class="mx-auto w-full max-w-5xl px-6 pt-16">
      <div class="flex flex-col gap-8 rounded-3xl bg-white/80 p-10 shadow-lg backdrop-blur">
        <div class="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-roadshop-accent">
              {{ i18nStore.t('hero.kicker') }}
            </p>
            <h1 class="mt-3 text-4xl font-bold text-roadshop-primary md:text-5xl">
              {{ i18nStore.t('hero.title') }}
            </h1>
          </div>
          <div class="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <div class="flex items-center gap-3 rounded-full bg-roadshop-primary px-4 py-2 text-sm text-white shadow">
              <span class="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>{{ i18nStore.t('hero.badge') }}</span>
            </div>
            <label
              class="relative flex cursor-pointer items-center gap-3 rounded-full border border-roadshop-primary/10 bg-white/70 px-4 py-2 text-xs font-semibold text-roadshop-primary shadow-sm backdrop-blur"
            >
              <span class="tracking-[0.2em] text-roadshop-accent">{{ i18nStore.t('language.label') }}</span>
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
          {{ i18nStore.t('hero.description') }}
        </p>
        <div class="grid gap-4 text-sm text-slate-500 md:grid-cols-3">
          <div class="rounded-2xl bg-roadshop-highlight/80 p-4">
            <p class="font-semibold text-roadshop-primary">{{ i18nStore.t('highlights.instant.title') }}</p>
            <p>{{ i18nStore.t('highlights.instant.description') }}</p>
          </div>
          <div class="rounded-2xl bg-roadshop-highlight/80 p-4">
            <p class="font-semibold text-roadshop-primary">{{ i18nStore.t('highlights.guidance.title') }}</p>
            <p>{{ i18nStore.t('highlights.guidance.description') }}</p>
          </div>
          <div class="rounded-2xl bg-roadshop-highlight/80 p-4">
            <p class="font-semibold text-roadshop-primary">{{ i18nStore.t('highlights.coverage.title') }}</p>
            <p>{{ i18nStore.t('highlights.coverage.description') }}</p>
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto mt-16 w-full max-w-5xl flex-1 px-6 pb-24">
      <section
        v-for="(section, index) in localizedSections"
        :key="section.currency"
        :class="['flex flex-col gap-6', index > 0 ? 'mt-16' : '']"
      >
        <div class="flex flex-col gap-2">
          <h2 class="text-2xl font-semibold text-roadshop-primary">
            {{ i18nStore.t(`sections.${section.currency.toLowerCase()}.title`) }}
          </h2>
          <p class="text-sm text-slate-500">
            {{ i18nStore.t(`sections.${section.currency.toLowerCase()}.description`) }}
          </p>
        </div>
        <div class="grid gap-6 md:grid-cols-2">
          <PaymentOptionCard
            v-for="method in section.methods"
            :key="method.id"
            :name="method.name"
            :description="method.description"
            :provider="method.provider"
            :status="method.status"
            :cta="method.cta"
            :url="method.url"
            :icons="method.icons"
          />
        </div>
      </section>
    </main>

    <footer class="border-t border-slate-200 bg-white/90 py-6 text-center text-xs text-slate-500">
      {{ footerCopy }}
    </footer>
  </div>
</template>
