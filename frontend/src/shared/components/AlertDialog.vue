<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

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
  <Dialog
    :visible="props.visible"
    modal
    :closable="false"
    :draggable="false"
    :breakpoints="{ '960px': '90vw' }"
    style="width: 22rem"
    :pt="{
      header: { class: 'gap-2' },
      content: { class: 'pt-0 text-sm text-color-secondary line-height-3' },
      footer: { class: 'flex justify-content-end' },
    }"
    @hide="onConfirm"
  >
    <template #header>
      <div class="flex align-items-center gap-2">
        <i class="pi pi-info-circle text-primary text-xl" aria-hidden="true"></i>
        <span class="font-semibold text-lg text-primary">{{ props.title }}</span>
      </div>
    </template>
    {{ props.message }}
    <template #footer>
      <Button severity="primary" :label="props.confirmLabel" @click="onConfirm" />
    </template>
  </Dialog>
</template>
