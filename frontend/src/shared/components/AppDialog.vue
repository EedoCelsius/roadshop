<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { useI18nStore } from '@/localization/store'

type DialogSize = 'md' | 'lg'
type CloseAlignment = 'full' | 'end'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title: string
    description?: string
    size?: DialogSize
    closeAlignment?: CloseAlignment
    closeLabel?: string
  }>(),
  {
    size: 'md' as DialogSize,
    closeAlignment: 'full' as CloseAlignment,
  },
)

const emit = defineEmits<{
  close: []
}>()

const i18nStore = useI18nStore()

const closeLabel = computed(() => props.closeLabel ?? i18nStore.t('dialog.close'))

const slots = useSlots()

const hasActions = computed(() => Boolean(slots.actions))

const footerClass = computed(() => {
  if (hasActions.value) {
    if (props.closeAlignment === 'end') {
      return 'mt-6 flex flex-wrap items-center justify-end gap-2'
    }

    return 'mt-6 flex flex-col gap-2'
  }

  return props.closeAlignment === 'end' ? 'mt-6 flex justify-end' : 'mt-6'
})

const closeButtonClass = computed(() => [
  'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100',
  { 'w-full': props.closeAlignment === 'full' },
])

const containerWidthClass = computed(() => {
  switch (props.size) {
    case 'lg':
      return 'max-w-lg'
    default:
      return 'max-w-md'
  }
})

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
        <div class="w-full rounded-2xl bg-white p-6 shadow-xl" :class="containerWidthClass" @click.stop>
          <header class="space-y-2">
            <h3 class="text-lg font-semibold text-roadshop-primary">{{ props.title }}</h3>
            <p v-if="props.description" class="text-sm text-slate-600" v-html="props.description"></p>
          </header>
          <div class="mt-6">
            <slot />
          </div>
          <footer :class="footerClass">
            <slot v-if="hasActions" name="actions" />
            <button type="button" :class="closeButtonClass" @click="onClose">
              {{ closeLabel }}
            </button>
          </footer>
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
