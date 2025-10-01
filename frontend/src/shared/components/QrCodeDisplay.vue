<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import QRCode from 'qrcode'

interface Props {
  value: string
  size?: number
  icon?: {
    src: string
    alt: string
    size?: number
  } | Array<{
    src: string
    alt: string
    size?: number
  }>
  iconInterval?: number
}

const props = defineProps<Props>()

const qrCodeDataUrl = ref('')
const normalizedIcons = computed(() => {
  if (!props.icon) {
    return []
  }

  return Array.isArray(props.icon) ? props.icon : [props.icon]
})
const iconInterval = computed(() => props.iconInterval ?? 2000)
const currentIconIndex = ref(0)
const activeIcon = computed(() => normalizedIcons.value[currentIconIndex.value] ?? null)
const iconSize = computed(() => activeIcon.value?.size ?? Math.round((props.size ?? 220) * 0.24))
const iconStyle = computed(() => ({
  width: `${iconSize.value}px`,
  height: `${iconSize.value}px`,
}))

watch(
  () => [props.value, props.size] as const,
  async ([value, size]) => {
    if (!value) {
      qrCodeDataUrl.value = ''
      return
    }

    try {
      qrCodeDataUrl.value = await QRCode.toDataURL(value, {
        margin: 1,
        width: size ?? 220,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#020617',
          light: '#ffffff',
        },
      })
    } catch (error) {
      console.error('Failed to generate QR code', error)
      qrCodeDataUrl.value = ''
    }
  },
  { immediate: true },
)

watchEffect((onCleanup) => {
  const icons = normalizedIcons.value
  const interval = iconInterval.value

  currentIconIndex.value = 0

  if (icons.length <= 1) {
    return
  }

  const id = setInterval(() => {
    currentIconIndex.value = (currentIconIndex.value + 1) % icons.length
  }, interval)

  onCleanup(() => {
    clearInterval(id)
  })
})
</script>

<template>
  <div
    v-if="qrCodeDataUrl"
    class="relative flex w-full max-w-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
  >
    <img :src="qrCodeDataUrl" alt="QR code" class="h-auto w-full" />
    <Transition name="qr-icon-fade" mode="out-in">
      <img
        v-if="activeIcon"
        :key="activeIcon.src"
        :src="activeIcon.src"
        :alt="activeIcon.alt"
        class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-1 shadow-sm"
        :style="iconStyle"
      />
    </Transition>
  </div>
</template>

<style scoped>
.qr-icon-fade-enter-active,
.qr-icon-fade-leave-active {
  transition: opacity 0.4s ease;
}

.qr-icon-fade-enter-from,
.qr-icon-fade-leave-to {
  opacity: 0;
}
</style>
