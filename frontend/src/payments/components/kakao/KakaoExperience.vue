<script setup lang="ts">
import { ref } from 'vue'

import IsNotInstalledDialog from '@/payments/components/IsNotInstalledDialog.vue'
import IsNotMobileDialog from '@/payments/components/IsNotMobileDialog.vue'
import { resolveDeepLink, launchDeepLink } from '@/payments/services/deepLinkService'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'

const paymentInfoStore = usePaymentInfoStore()

const notMobileDialogRef = ref<InstanceType<typeof IsNotMobileDialog> | null>(null)
const notInstalledDialogRef = ref<InstanceType<typeof IsNotInstalledDialog> | null>(null)

const run = async (): Promise<boolean> => {
  const ready = await paymentInfoStore.ensureMethodInfo('kakao')

  if (!ready) {
    return false
  }

  const info = paymentInfoStore.getDeepLinkInfo('kakao')

  if (!info) {
    console.error('Missing kakao payment info payload')
    return false
  }

  try {
    const deepLink = resolveDeepLink('kakao', info)

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
</script>

<template>
  <IsNotMobileDialog ref="notMobileDialogRef" method="kakao" />
  <IsNotInstalledDialog ref="notInstalledDialogRef" method="kakao" />
</template>
