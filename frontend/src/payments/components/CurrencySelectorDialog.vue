<script setup lang="ts">
import { computed } from 'vue'

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
const closeLabel = computed(() => i18nStore.t('dialog.close'))

const onSelectCurrency = (currency: string) => {
  emit('select', currency)
}

const onClose = () => {
  emit('close')
}
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    dismissable-mask
    close-on-escape
    :header="title"
    :style="{ width: 'min(90vw, 24rem)' }"
    :pt="{
      root: { class: 'rounded-3xl border-0 bg-white/95 shadow-xl backdrop-blur-sm' },
      mask: { class: 'bg-slate-900/40 backdrop-blur-sm' },
      header: { class: 'text-roadshop-primary font-semibold text-lg' },
      content: { class: 'pt-0 text-slate-600' },
      footer: { class: 'flex justify-end gap-2' },
    }"
    @update:visible="(value) => {
      if (!value) {
        onClose()
      }
    }"
  >
    <p class="text-sm text-slate-600">{{ description }}</p>
    <div class="mt-5 grid gap-3">
      <Button
        v-for="currency in props.currencies"
        :key="currency"
        type="button"
        :label="currency"
        icon="pi pi-arrow-right"
        icon-pos="right"
        outlined
        severity="primary"
        class="justify-between text-sm font-semibold"
        @click="onSelectCurrency(currency)"
      />
    </div>
    <template #footer>
      <Button type="button" :label="closeLabel" text severity="secondary" @click="onClose" />
    </template>
  </Dialog>
</template>
