<script setup lang="ts">
import { computed } from 'vue'

import Dialog from 'primevue/dialog'
import Listbox from 'primevue/listbox'

import { useI18nStore } from '@/localization/store'

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

const onSelectCurrency = (currency: string) => {
  emit('select', currency)
}

const dialogVisibility = computed({
  get: () => props.visible,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  },
})

const options = computed(() =>
  props.currencies.map((currency) => ({
    label: currency,
    value: currency,
  })),
)
</script>

<template>
  <Dialog
    v-model:visible="dialogVisibility"
    modal
    :header="title"
    :style="{ width: '22rem' }"
    :dismissableMask="true"
    content-class="rounded-3xl"
  >
    <p class="mb-4 text-sm leading-relaxed text-slate-600">
      {{ description }}
    </p>
    <Listbox
      :options="options"
      option-label="label"
      option-value="value"
      class="w-full rounded-2xl border border-roadshop-primary/10"
      @update:modelValue="onSelectCurrency"
    >
      <template #option="{ option }">
        <div class="flex items-center justify-between gap-2 px-4 py-3 text-roadshop-primary">
          <span class="text-sm font-semibold">{{ option.label }}</span>
          <i class="pi pi-arrow-right text-roadshop-accent"></i>
        </div>
      </template>
    </Listbox>
  </Dialog>
</template>
