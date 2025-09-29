<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  visible: boolean
  message: string
  variant?: 'default' | 'success'
}

const props = defineProps<Props>()

const variantClasses = computed(() => {
  if (props.variant === 'success') {
    return {
      bubble: 'bg-emerald-500 text-white',
      arrow: 'border-t-emerald-500',
    }
  }

  return {
    bubble: 'bg-slate-800 text-white',
    arrow: 'border-t-slate-800',
  }
})
</script>

<template>
  <Transition name="tooltip-bubble-fade">
    <div
      v-if="props.visible"
      class="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[15px] transform whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold shadow-lg"
      :class="variantClasses.bubble"
      role="status"
      aria-live="polite"
    >
      {{ props.message }}
      <span
        class="absolute left-1/2 top-full -translate-x-1/2 border-4 border-x-transparent border-b-transparent"
        :class="variantClasses.arrow"
        aria-hidden="true"
      ></span>
    </div>
  </Transition>
</template>

<style scoped>
.tooltip-bubble-fade-enter-active,
.tooltip-bubble-fade-leave-active {
  transition: opacity 0.15s ease;
}

.tooltip-bubble-fade-enter-from,
.tooltip-bubble-fade-leave-to {
  opacity: 0;
}
</style>
