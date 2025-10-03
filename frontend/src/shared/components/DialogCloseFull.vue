<script setup lang="ts">
import { computed } from 'vue'

import DialogBase from '@/shared/components/DialogBase.vue'
import { useI18nStore } from '@/localization/store'

const props = defineProps<{
  title: string
  description?: string
  closeLabel?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const i18nStore = useI18nStore()

const closeLabel = computed(() => props.closeLabel ?? i18nStore.t('dialogs.close'))

const onClose = () => {
  emit('close')
}
</script>

<template>
  <DialogBase :title="props.title" :description="props.description" @close="onClose">
    <slot />
    <template #footer>
      <footer class="mt-6">
        <button
          type="button"
          class="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
          @click="onClose"
        >
          {{ closeLabel }}
        </button>
      </footer>
    </template>
  </DialogBase>
</template>
