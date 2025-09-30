<script setup lang="ts">
import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps<{
  visible: boolean
  message: string
}>()
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    :show-header="false"
    :closable="false"
    :draggable="false"
    :dismissable-mask="false"
    :content-style="{ padding: '2rem' }"
  >
    <div class="flex flex-column align-items-center gap-3">
      <ProgressSpinner style="width: 3rem; height: 3rem" stroke-width="4" />
      <span class="text-sm font-semibold text-color-secondary">{{ props.message }}</span>
    </div>
  </Dialog>
</template>
