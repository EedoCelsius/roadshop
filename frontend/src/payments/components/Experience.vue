<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import CurrencySelectorDialog from '@/payments/components/CurrencySelectorDialog.vue'
import Section from '@/payments/components/Section.vue'
import TransferAccountsDialog from '@/payments/components/TransferAccountsDialog/TransferAccountsDialog.vue'
import TossInstructionDialog from '@/payments/components/TossInstructionDialog.vue'
import { useLocalizedSections } from '@/payments/composables/useLocalizedSections'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { usePaymentInteractionStore } from '@/payments/stores/paymentInteraction.store'
import { useI18nStore } from '@/localization/store'
import BusyOverlay from '@/shared/components/BusyOverlay.vue'

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
  hasCopiedTossAccountInfo,
  tossAccountInfo,
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
      :key="`${entry.section.currency}-${index}`"
      :section="entry.section"
      :title="entry.title"
      :description="entry.description"
      @select="onSelectMethod"
    />

    <Dialog
      v-if="popupContent"
      :visible="isPopupVisible"
      modal
      :header="popupContent.title"
      :style="{ width: 'min(90vw, 28rem)' }"
      dismissable-mask
      close-on-escape
      :pt="{
        root: { class: 'rounded-3xl border-0 bg-white/95 shadow-xl backdrop-blur-sm' },
        mask: { class: 'bg-slate-900/40 backdrop-blur-sm' },
        header: { class: 'text-roadshop-primary font-semibold text-lg' },
        content: { class: 'text-slate-600' },
        footer: { class: 'flex justify-end' },
      }"
      @update:visible="(value) => {
        if (!value) {
          onPopupConfirm()
        }
      }"
    >
      <p class="text-sm leading-relaxed text-slate-600">
        {{ popupContent.message }}
      </p>
      <template #footer>
        <Button
          type="button"
          :label="popupContent.confirmLabel"
          class="min-w-[7rem]"
          severity="primary"
          @click="onPopupConfirm"
        />
      </template>
    </Dialog>
    <CurrencySelectorDialog
      v-if="selectedMethod"
      :visible="isCurrencySelectorOpen"
      :method-name="selectedMethod.name"
      :currencies="selectedMethod.supportedCurrencies"
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
      :copied="hasCopiedTossAccountInfo"
      @close="onCloseTossInstructionDialog"
      @launch-now="onLaunchTossInstructionDialog"
      @reopen="onReopenTossInstructionDialog"
    />
    <BusyOverlay :visible="isDeepLinkChecking" :message="i18nStore.t('loading.deepLink')" />
  </div>
</template>
