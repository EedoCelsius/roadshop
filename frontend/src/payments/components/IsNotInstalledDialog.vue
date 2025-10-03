<script setup lang="ts">
import DialogCloseEnd from '@/shared/components/DialogCloseEnd.vue'

const props = defineProps<{
  visible: boolean
  title: string
  description?: string
  confirmLabel?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const onClose = () => {
  emit('close')
}
</script>

<template>
  <DialogCloseEnd
    :visible="props.visible"
    :title="props.title"
    :description="props.description"
    :close-label="props.confirmLabel"
    @close="onClose"
  />
</template>
