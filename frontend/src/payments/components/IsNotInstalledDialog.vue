<script setup lang="ts">
import { computed, ref } from 'vue'

import DialogCloseEnd from '@/shared/components/DialogCloseEnd.vue'
import { useI18nStore } from '@/localization/store'

interface Props {
  method: string
}

const props = defineProps<Props>()

const emit = defineEmits<{ close: [] }>()

const i18nStore = useI18nStore()

const isVisible = ref(false)

const methodLabel = computed(() => i18nStore.t(`options.${props.method}`, props.method))
const title = computed(() => i18nStore.t('dialogs.notInstalled.title'))
const confirmLabel = computed(() => i18nStore.t('dialogs.confirm'))
const description = computed(() => {
  const template = i18nStore.t('dialogs.notInstalled.description')
  return template.includes('{method}') ? template.replace('{method}', methodLabel.value) : template
})

const close = () => {
  isVisible.value = false
  emit('close')
}

const open = () => {
  isVisible.value = true
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <DialogCloseEnd
    v-if="isVisible"
    :title="title"
    :description="description"
    :close-label="confirmLabel"
    @close="close"
  />
</template>
