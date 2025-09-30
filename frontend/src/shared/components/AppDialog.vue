<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'

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

const emit = defineEmits<{ close: [] }>()

const i18nStore = useI18nStore()

const closeLabel = computed(() => props.closeLabel ?? i18nStore.t('dialog.close'))

const footerClass = computed(() =>
  props.closeAlignment === 'end'
    ? 'mt-6 flex justify-end'
    : 'mt-6 flex flex-col gap-3',
)

const closeButtonClass = computed(() => [
  'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-roadshop-primary',
  { 'w-full': props.closeAlignment === 'full' },
])

const containerWidthClass = computed(() => {
  switch (props.size) {
    case 'lg':
      return 'sm:max-w-lg'
    default:
      return 'sm:max-w-md'
  }
})

const dialogVisibility = computed({
  get: () => props.visible,
  set: (value: boolean) => {
    if (!value) {
      emit('close')
    }
  },
})

const dialogPassThrough = computed(() => ({
  mask: {
    class: 'bg-slate-900/60 backdrop-blur-sm flex items-center justify-center px-6',
  },
  root: {
    class: ['border-0 shadow-xl rounded-2xl w-full', containerWidthClass.value],
  },
  header: {
    class: 'px-6 pt-6 pb-3',
  },
  content: {
    class: 'px-6 pb-0',
  },
  footer: {
    class: 'px-6 pb-6',
  },
}))

const onClose = () => {
  emit('close')
}
</script>

<template>
  <Dialog
    v-model:visible="dialogVisibility"
    modal
    :draggable="false"
    :closable="false"
    :dismissable-mask="true"
    :close-on-escape="true"
    :block-scroll="true"
    :breakpoints="{ '640px': '90vw' }"
    :pt="dialogPassThrough"
  >
    <template #header>
      <header class="space-y-2">
        <h3 class="text-lg font-semibold text-roadshop-primary">{{ props.title }}</h3>
        <p v-if="props.description" class="text-sm text-slate-600" v-html="props.description"></p>
      </header>
    </template>
    <div class="mt-4">
      <slot />
    </div>
    <template #footer>
      <div :class="footerClass">
        <button type="button" :class="closeButtonClass" @click="onClose">
          {{ closeLabel }}
        </button>
      </div>
    </template>
  </Dialog>
</template>
