<script setup lang="ts">
import AppDialog from '@/shared/components/AppDialog.vue'

const props = defineProps<{
  visible: boolean
  title: string
  message: string
  confirmLabel: string
}>()

const emit = defineEmits<{ confirm: [] }>()

const onConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <AppDialog
    :visible="props.visible"
    :title="props.title"
    close-alignment="end"
    :close-label="props.confirmLabel"
    @close="onConfirm"
  >
    <p class="text-sm leading-relaxed text-slate-600">
      {{ props.message }}
    </p>
  </AppDialog>
</template>
