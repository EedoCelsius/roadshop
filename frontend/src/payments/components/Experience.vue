<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import DialogCloseEnd from '@/shared/components/DialogCloseEnd.vue'
import LoadingOverlay from '@/shared/components/LoadingOverlay.vue'
import CurrencySelectorDialog from '@/payments/components/CurrencySelectorDialog.vue'
import Section from '@/payments/components/Section.vue'
import TransferAccountsDialog from '@/payments/components/TransferAccountsDialog/TransferAccountsDialog.vue'
import TossInstructionDialog from '@/payments/components/TossInstructionDialog.vue'
import { useLocalizedSections } from '@/payments/composables/useLocalizedSections'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { usePaymentInteractionStore } from '@/payments/stores/paymentInteraction.store'
import { useI18nStore } from '@/localization/store'

const paymentStore = usePaymentStore()
const paymentInteractionStore = usePaymentInteractionStore()
const i18nStore = useI18nStore()

const { selectedMethod, isCurrencySelectorOpen } = storeToRefs(paymentStore)
const {
  isPopupVisible,
  popupContent,
  isDeepLinkChecking,
  isTransferDialogVisible,
  transferAmount,
  transferAccounts,
  isTossInstructionDialogVisible,
  tossInstructionCountdown,
  tossAccountInfo,
} = storeToRefs(paymentInteractionStore)

const { sections } = useLocalizedSections()

const localizedSections = computed(() =>
  sections.value.map((section) => ({
    section,
    title: i18nStore.t(`sections.${section.category.toLowerCase()}.title`),
    description: i18nStore.t(`sections.${section.category.toLowerCase()}.description`),
  })),
)

const selectedMethodName = computed(() =>
  selectedMethod.value ? i18nStore.t(`payment.${selectedMethod.value.id}.name`) : '',
)

const selectedMethodCurrencies = computed(() => selectedMethod.value?.supportedCurrencies ?? [])

const onSelectMethod = (methodId: string) => {
  void paymentInteractionStore.handleMethodSelection(methodId)
}

const onCurrencySelect = (currency: string) => {
  void paymentInteractionStore.handleCurrencySelection(currency)
}

const onCloseCurrencySelector = () => {
  paymentStore.closeCurrencySelector()
}

const onPopupConfirm = () => {
  paymentInteractionStore.closePopup()
}

const onCloseTransferDialog = () => {
  paymentInteractionStore.closeTransferDialog()
}

const onCloseTossInstructionDialog = () => {
  paymentInteractionStore.closeTossInstructionDialog()
}

const onReopenTossInstructionDialog = () => {
  void paymentInteractionStore.reopenTossDeepLink()
}

const onLaunchTossInstructionDialog = () => {
  paymentInteractionStore.completeTossInstructionCountdown()
}
</script>

<template>
  <div class="flex flex-col gap-16">
    <Section
      v-for="(entry, index) in localizedSections"
      :key="`${entry.section.category}-${index}`"
      :section="entry.section"
      :title="entry.title"
      :description="entry.description"
      @select="onSelectMethod"
    />

    <DialogCloseEnd
      v-if="popupContent"
      :visible="isPopupVisible"
      :title="popupContent.title"
      :description="popupContent.message"
      :close-label="popupContent.confirmLabel"
      @close="onPopupConfirm"
    />
    <CurrencySelectorDialog
      v-if="selectedMethod"
      :visible="isCurrencySelectorOpen"
      :method-name="selectedMethodName"
      :currencies="selectedMethodCurrencies"
      @select="onCurrencySelect"
      @close="onCloseCurrencySelector"
    />
    <TransferAccountsDialog
      :visible="isTransferDialogVisible"
      :accounts="transferAccounts"
      :amount="transferAmount"
      @close="onCloseTransferDialog"
    />
    <TossInstructionDialog
      :visible="isTossInstructionDialogVisible"
      :info="tossAccountInfo"
      :countdown="tossInstructionCountdown"
      @close="onCloseTossInstructionDialog"
      @launch-now="onLaunchTossInstructionDialog"
      @reopen="onReopenTossInstructionDialog"
    />
    <LoadingOverlay :visible="isDeepLinkChecking" :message="i18nStore.t('loading.deepLink')" />
  </div>
</template>
