<script setup lang="ts">
import { computed, ref } from 'vue'

import IsNotInstalledDialog from '@/payments/components/IsNotInstalledDialog.vue'
import IsNotMobileDialog from '@/payments/components/IsNotMobileDialog.vue'
import { launchDeepLink } from '@/payments/services/deepLinkService'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'

const paymentInfoStore = usePaymentInfoStore()

const notMobileDialogRef = ref<InstanceType<typeof IsNotMobileDialog> | null>(null)
const notInstalledDialogRef = ref<InstanceType<typeof IsNotInstalledDialog> | null>(null)

const kakaoInfo = computed(() => paymentInfoStore.kakaoInfo)

const emit = defineEmits<{ close: [] }>()

const run = async (): Promise<boolean> => {
  const ready = await paymentInfoStore.ensureMethodInfo('kakao')

  if (!ready) {
    return false
  }

  const info = kakaoInfo.value

  if (!info) {
    console.error('Missing kakao payment info payload')
    return false
  }

  const deepLink = info.deepLink

  if (!deepLink) {
    console.error('Missing kakao deep link in payload')
    return false
  }

  try {
    await launchDeepLink(deepLink, {
      timeoutMs: 1500,
      onNotInstalled: () => notInstalledDialogRef.value?.open(),
      onNotMobile: () => notMobileDialogRef.value?.open(),
    })

    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

defineExpose({
  run,
})

const onDialogClose = () => {
  emit('close')
}
</script>

<template>
  <IsNotMobileDialog ref="notMobileDialogRef" method="kakao" @close="onDialogClose" />
  <IsNotInstalledDialog ref="notInstalledDialogRef" method="kakao" @close="onDialogClose" />
</template>
