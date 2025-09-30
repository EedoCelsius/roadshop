<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { useI18nStore } from '@/localization/store'

import Dialog from 'primevue/dialog'
import Listbox from 'primevue/listbox'

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

const selectedCurrency = ref<string | null>(null)

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      selectedCurrency.value = null
    }
  },
)

const onSelectCurrency = (currency: string | null) => {
  if (currency) {
    emit('select', currency)
  }
}

const onClose = () => {
  emit('close')
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    :draggable="false"
    :breakpoints="{ '960px': '90vw' }"
    style="width: 26rem"
    @hide="onClose"
  >
    <template #header>
      <div class="flex flex-column gap-1">
        <span class="font-semibold text-lg text-primary">{{ title }}</span>
        <small class="text-sm text-color-secondary">{{ description }}</small>
      </div>
    </template>
    <Listbox
      v-model="selectedCurrency"
      :options="props.currencies"
      class="w-full"
      :pt="{ list: { class: 'max-h-20rem' } }"
      @update:modelValue="onSelectCurrency"
    />
  </Dialog>
</template>
