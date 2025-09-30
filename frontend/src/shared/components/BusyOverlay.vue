<template>
  <Dialog
    :visible="visible"
    modal
    :closable="false"
    :dismissable-mask="false"
    block-scroll
    :pt="{
      root: { class: 'border-none bg-transparent shadow-none backdrop-blur-sm' },
      mask: { class: 'bg-slate-900/50 backdrop-blur-sm' },
      content: { class: 'bg-transparent' },
    }"
  >
    <div class="flex flex-col items-center gap-4 rounded-3xl bg-white/90 px-10 py-8 text-roadshop-primary shadow-xl">
      <ProgressSpinner style="width: 3rem; height: 3rem" stroke-width="4" />
      <p class="text-sm font-semibold text-roadshop-primary/80">{{ message }}</p>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  message: string
}>()
</script>
