<script setup lang="ts">
import { computed } from 'vue'

import { useI18nStore } from '@/stores/i18n'

interface Props {
  visible: boolean
  methodName: string
  currencies: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [string]
  close: []
}>()

const i18nStore = useI18nStore()

const title = computed(() => i18nStore.t('currencySelector.title'))
const description = computed(() =>
  i18nStore.t('currencySelector.description').replace('{method}', props.methodName),
)
const cancelLabel = computed(() => i18nStore.t('currencySelector.cancel'))

const onBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const onSelectCurrency = (currency: string) => {
  emit('select', currency)
}

const onClose = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="props.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-6"
        @click="onBackdropClick"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" @click.stop>
          <h3 class="text-lg font-semibold text-roadshop-primary">{{ title }}</h3>
          <p class="mt-2 text-sm text-slate-600">{{ description }}</p>

          <div class="mt-6 grid gap-3">
            <button
              v-for="currency in props.currencies"
              :key="currency"
              type="button"
              class="flex items-center justify-between rounded-xl border border-roadshop-primary/20 px-4 py-3 text-roadshop-primary transition hover:border-roadshop-accent hover:bg-roadshop-highlight/60"
              @click="onSelectCurrency(currency)"
            >
              <span class="text-sm font-semibold">{{ currency }}</span>
              <span aria-hidden="true" class="text-roadshop-accent">→</span>
            </button>
          </div>

          <button
            type="button"
            class="mt-6 w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
            @click="onClose"
          >
            {{ cancelLabel }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
