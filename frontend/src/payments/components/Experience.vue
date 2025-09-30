<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import ActionPopup from '@/shared/components/ActionPopup.vue'
import LoadingOverlay from '@/shared/components/LoadingOverlay.vue'
import CurrencySelectorDialog from '@/payments/components/CurrencySelectorDialog.vue'
import Section from '@/payments/components/Section.vue'
import TransferAccountsDialog from '@/payments/components/TransferAccountsDialog/TransferAccountsDialog.vue'
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
} = storeToRefs(paymentInteractionStore)

const { sections } = useLocalizedSections()

const localizedSections = computed(() =>
  sections.value.map((section) => ({
    section,
    title: i18nStore.t(`sections.${section.currency.toLowerCase()}.title`),
    description: i18nStore.t(`sections.${section.currency.toLowerCase()}.description`),
  })),
)

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
</script>

<template>
  <div class="flex flex-col gap-16">
    <Section
      v-for="(entry, index) in localizedSections"
      :key="`${entry.section.currency}-${index}`"
      :section="entry.section"
      :title="entry.title"
      :description="entry.description"
      @select="onSelectMethod"
    />

    <CurrencySelectorDialog
      v-if="selectedMethod"
      :visible="isCurrencySelectorOpen"
      :method-name="selectedMethod.name"
      :currencies="selectedMethod.supportedCurrencies"
      @select="onCurrencySelect"
      @close="onCloseCurrencySelector"
    />
    <ActionPopup
      v-if="popupContent"
      :visible="isPopupVisible"
      :title="popupContent.title"
      :message="popupContent.message"
      :confirm-label="popupContent.confirmLabel"
      @confirm="onPopupConfirm"
    />
    <TransferAccountsDialog
      :visible="isTransferDialogVisible"
      :accounts="transferAccounts"
      :amount="transferAmount"
      @close="onCloseTransferDialog"
    />
    <LoadingOverlay :visible="isDeepLinkChecking" :message="i18nStore.t('loading.deepLink')" />
  </div>
</template>
