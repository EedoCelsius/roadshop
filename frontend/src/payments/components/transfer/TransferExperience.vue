<script setup lang="ts">
import { computed, ref } from 'vue'

import TransferAccountsDialog from '@/payments/components/TransferAccountsDialog/TransferAccountsDialog.vue'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'

const emit = defineEmits<{ close: [] }>()

const paymentInfoStore = usePaymentInfoStore()
const isDialogVisible = ref(false)

const transferAmount = computed(() => paymentInfoStore.transferInfo?.amount.krw ?? 0)
const transferAccounts = computed(() => paymentInfoStore.transferInfo?.account ?? [])

const openDialog = async (): Promise<boolean> => {
  const ready = await paymentInfoStore.ensureMethodInfo('transfer')

  if (!ready) {
    return false
  }

  isDialogVisible.value = true
  return true
}

const closeDialog = () => {
  isDialogVisible.value = false
}

const onClose = () => {
  closeDialog()
  emit('close')
}

defineExpose({
  run: openDialog,
})
</script>

<template>
  <TransferAccountsDialog
    v-if="isDialogVisible"
    :accounts="transferAccounts"
    :amount="transferAmount"
    @close="onClose"
  />
</template>
