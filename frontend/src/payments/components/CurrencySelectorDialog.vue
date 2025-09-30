<script setup lang="ts">
import { computed } from 'vue'

import { useI18nStore } from '@/localization/store'
import DialogCloseFull from '@/shared/components/DialogCloseFull.vue'

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

const onClose = () => {
  emit('close')
}
</script>

<template>
  <DialogCloseFull
    :visible="props.visible"
    :title="title"
    :description="description"
    @close="onClose"
  >
    <div class="grid gap-3">
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
  </DialogCloseFull>
</template>
