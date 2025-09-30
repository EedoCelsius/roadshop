<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import LoadingOverlay from '@/shared/components/LoadingOverlay.vue'
import CurrencySelectorDialog from '@/payments/components/CurrencySelectorDialog.vue'
import Section from '@/payments/components/Section.vue'
import TransferAccountsDialog from '@/payments/components/TransferAccountsDialog/TransferAccountsDialog.vue'
import { useLocalizedSections } from '@/payments/composables/useLocalizedSections'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { usePaymentInteractionStore } from '@/payments/stores/paymentInteraction.store'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

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

const alertVisibility = computed({
  get: () => isPopupVisible.value,
  set: (value: boolean) => {
    if (!value) {
      onPopupConfirm()
    }
  },
})

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
    <Dialog
      v-if="popupContent"
      v-model:visible="alertVisibility"
      modal
      :header="popupContent.title"
      :style="{ width: '26rem' }"
      :dismissableMask="true"
      content-class="rounded-3xl"
    >
      <p class="text-sm leading-relaxed text-slate-600">
        {{ popupContent.message }}
      </p>
      <template #footer>
        <Button
          :label="popupContent.confirmLabel"
          class="w-full md:w-auto"
          severity="primary"
          @click="onPopupConfirm"
        />
      </template>
    </Dialog>
    <TransferAccountsDialog
      :visible="isTransferDialogVisible"
      :accounts="transferAccounts"
      :amount="transferAmount"
      @close="onCloseTransferDialog"
    />
    <LoadingOverlay :visible="isDeepLinkChecking" :message="i18nStore.t('loading.deepLink')" />
  </div>
</template>
