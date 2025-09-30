<script setup lang="ts">
const props = defineProps<{
  visible: boolean
  title: string
  description?: string
}>()

const emit = defineEmits<{
  close: []
}>()

const onBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    emit('close')
  }
}

const onClose = () => {
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div
        v-if="props.visible"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/60 px-6"
        @click="onBackdropClick"
      >
        <div class="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" @click.stop>
          <header class="space-y-2">
            <h3 class="text-lg font-semibold text-roadshop-primary">{{ props.title }}</h3>
            <p v-if="props.description" class="text-sm text-slate-600" v-html="props.description"></p>
          </header>
          <div class="mt-6">
            <slot />
          </div>
          <slot name="footer" :on-close="onClose" />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>
