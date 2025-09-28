<script setup lang="ts">
interface Props {
  visible: boolean
  title: string
  message: string
  confirmLabel: string
}

const props = defineProps<Props>()

const emit = defineEmits<{ confirm: [] }>()

const onConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popup-fade">
      <div
        v-if="props.visible"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-6"
        role="dialog"
        aria-modal="true"
      >
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
          <div class="flex flex-col gap-4">
            <header class="space-y-2">
              <h2 class="text-xl font-semibold text-roadshop-primary">{{ props.title }}</h2>
              <p class="text-sm leading-relaxed text-slate-600">
                {{ props.message }}
              </p>
            </header>
            <footer class="flex justify-end">
              <button
                type="button"
                class="rounded-full bg-roadshop-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-roadshop-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-roadshop-accent"
                @click="onConfirm"
              >
                {{ props.confirmLabel }}
              </button>
            </footer>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: opacity 0.2s ease;
}

.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
</style>
