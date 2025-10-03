<script setup lang="ts">
import { computed, ref } from 'vue'

import IsNotInstalledDialog from '@/payments/components/IsNotInstalledDialog.vue'
import IsNotMobileDialog from '@/payments/components/IsNotMobileDialog.vue'
import TossInstructionDialog from '@/payments/components/TossInstructionDialog.vue'
import { createCountdownManager } from '@/payments/stores/utils/createCountdownManager'
import { copyTransferInfo } from '@/payments/utils/copyTransferInfo'
import { resolveDeepLink, launchDeepLink } from '@/payments/services/deepLinkService'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'

const paymentInfoStore = usePaymentInfoStore()

const isInstructionVisible = ref(false)
const tossInstructionCountdown = ref(0)
const tossDeepLinkUrl = ref<string | null>(null)
const notMobileDialogRef = ref<InstanceType<typeof IsNotMobileDialog> | null>(null)
const notInstalledDialogRef = ref<InstanceType<typeof IsNotInstalledDialog> | null>(null)

const emit = defineEmits<{ close: [] }>()

const tossInfo = computed(() => paymentInfoStore.tossInfo)

const countdownManager = createCountdownManager((remainingSeconds) => {
  tossInstructionCountdown.value = remainingSeconds
})

const resetInstructionState = () => {
  countdownManager.reset()
  tossInstructionCountdown.value = 0
}

const closeInstructionDialog = () => {
  countdownManager.cancel()
  isInstructionVisible.value = false
  tossInstructionCountdown.value = 0
  tossDeepLinkUrl.value = null
}

const emitClose = () => {
  emit('close')
}

const showInstructionDialog = async (seconds: number): Promise<boolean> => {
  isInstructionVisible.value = true
  return countdownManager.start(seconds)
}

const runDeepLink = async (deepLink: string) => {
  await launchDeepLink(deepLink, {
    timeoutMs: 2000,
    onNotInstalled: () => notInstalledDialogRef.value?.open(),
    onNotMobile: () => notMobileDialogRef.value?.open(),
  })
}

const run = async (): Promise<boolean> => {
  const ready = await paymentInfoStore.ensureMethodInfo('toss')

  if (!ready) {
    return false
  }

  const info = tossInfo.value

  if (!info) {
    console.error('Missing toss payment info payload')
    return false
  }

  try {
    const deepLink = resolveDeepLink('toss', info)
    tossDeepLinkUrl.value = deepLink

    await copyTransferInfo(info.account, info.amount.krw)
    const shouldLaunch = await showInstructionDialog(5)

    if (!shouldLaunch) {
      resetInstructionState()
      return false
    }

    await runDeepLink(deepLink)
    resetInstructionState()
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

const onInstructionClose = () => {
  closeInstructionDialog()
  emitClose()
}

const onInstructionLaunchNow = () => {
  countdownManager.complete()
}

const onInstructionReopen = () => {
  if (!tossDeepLinkUrl.value) {
    return
  }

  void runDeepLink(tossDeepLinkUrl.value)
}

const onDialogClose = () => {
  emitClose()
}

defineExpose({
  run,
})
</script>

<template>
  <TossInstructionDialog
    v-if="isInstructionVisible"
    :info="tossInfo"
    :countdown="tossInstructionCountdown"
    @close="onInstructionClose"
    @launch-now="onInstructionLaunchNow"
    @reopen="onInstructionReopen"
  />
  <IsNotMobileDialog ref="notMobileDialogRef" method="toss" @close="onDialogClose" />
  <IsNotInstalledDialog ref="notInstalledDialogRef" method="toss" @close="onDialogClose" />
</template>
