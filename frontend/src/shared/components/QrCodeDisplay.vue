<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import QRCode from 'qrcode'

interface Props {
  value: string
  size?: number
  icon?: {
    src: string
    alt: string
    size?: number
  }
}

const props = defineProps<Props>()

const qrCodeDataUrl = ref('')
const iconSize = computed(() => props.icon?.size ?? Math.round((props.size ?? 220) * 0.24))
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
</script>

<template>
  <div
    v-if="qrCodeDataUrl"
    class="relative flex w-full max-w-[220px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 shadow-md"
  >
    <img :src="qrCodeDataUrl" alt="QR code" class="h-auto w-full" />
    <img
      v-if="props.icon"
      :src="props.icon.src"
      :alt="props.icon.alt"
      class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-1 shadow-sm"
      :style="iconStyle"
    />
  </div>
</template>
