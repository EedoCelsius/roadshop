<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  message: string
}>()
</script>

<template>
  <div
    v-if="props.visible"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-slate-900/40 backdrop-blur"
  >
    <div class="flex items-center justify-center">
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
    </div>
    <p class="text-sm font-semibold text-white drop-shadow">
      {{ props.message }}
    </p>
  </div>
</template>
