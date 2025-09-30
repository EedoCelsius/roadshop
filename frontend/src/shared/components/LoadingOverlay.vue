<script setup lang="ts">
import { computed } from 'vue'

import Dialog from 'primevue/dialog'
import ProgressSpinner from 'primevue/progressspinner'

const props = defineProps<{
  visible: boolean
  message: string
}>()

const dialogVisibility = computed({
  get: () => props.visible,
  set: () => {
    // Dialog should remain controlled by parent state
  },
})
</script>

<template>
    <Dialog
      v-model:visible="dialogVisibility"
      modal
      :show-header="false"
      :closable="false"
      :dismissableMask="false"
      style="width: 18rem"
      content-class="bg-white/90 backdrop-blur rounded-3xl"
  >
    <div class="flex flex-col items-center justify-center gap-4 py-8">
      <ProgressSpinner strokeWidth="4" style="width: 3rem; height: 3rem" />
      <p class="text-sm font-semibold text-roadshop-primary text-center">
        {{ props.message }}
      </p>
    </div>
  </Dialog>
</template>
