<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import DialogCloseEnd from '@/shared/components/DialogCloseEnd.vue'
import DialogCloseFull from '@/shared/components/DialogCloseFull.vue'
import LoadingOverlay from '@/shared/components/LoadingOverlay.vue'
import CurrencySelectorDialog from '@/payments/components/CurrencySelectorDialog.vue'
import Section from '@/payments/components/Section.vue'
import TransferAccountsDialog from '@/payments/components/TransferAccountsDialog/TransferAccountsDialog.vue'
import TossInstructionDialog from '@/payments/components/TossInstructionDialog.vue'
import QrCodeDisplay from '@/shared/components/QrCodeDisplay.vue'
import { useLocalizedSections } from '@/payments/composables/useLocalizedSections'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { usePaymentInteractionStore } from '@/payments/stores/paymentInteraction.store'
import { useI18nStore } from '@/localization/store'
import type {
  DeepLinkProvider,
  PaymentCategory,
  PaymentIcon,
  PaymentMethodWithCurrencies,
} from '@/payments/types'

const paymentStore = usePaymentStore()
const paymentInteractionStore = usePaymentInteractionStore()
const i18nStore = useI18nStore()

const { methods, selectedMethod, isCurrencySelectorOpen, isLoading: areMethodsLoading, error: methodsError } =
  storeToRefs(paymentStore)
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

const categorizeMethod = (method: PaymentMethodWithCurrencies): PaymentCategory =>
  method.supportedCurrencies.some((currency) => currency !== 'KRW') ? 'GLOBAL' : 'KRW'

const { sections } = useLocalizedSections(categorizeMethod)

const localizedSections = computed(() =>
  sections.value.map((section) => ({
    section,
    title: i18nStore.t(`sections.${section.category.toLowerCase()}.title`),
  })),
)

const hasVisibleMethods = computed(() =>
  localizedSections.value.some((entry) => entry.section.methods.length > 0),
)

const selectedMethodName = computed(() =>
  selectedMethod.value ? i18nStore.t(`payment.${selectedMethod.value.id}.name`) : '',
)

const selectedMethodCurrencies = computed(() => selectedMethod.value?.supportedCurrencies ?? [])

const isNotMobilePopup = computed(() => popupContent.value?.type === 'not-mobile')
const popupQrValue = computed(() => popupContent.value?.deepLinkUrl ?? null)
const popupQrHint = computed(() => {
  if (!popupContent.value) {
    return null
  }

  const key = `popups.deepLink.providers.${popupContent.value.provider}.qrHint`
  const translation = i18nStore.t(key)

  return translation === key ? null : translation
})
const deepLinkProviderIcons = computed(() =>
  methods.value.reduce<Partial<Record<DeepLinkProvider, PaymentIcon>>>((map, method) => {
    if (method.deepLinkProvider && method.icons?.[0]) {
      map[method.deepLinkProvider] = method.icons[0]
    }

    return map
  }, {}),
)
const popupQrIcon = computed(() =>
  popupContent.value ? deepLinkProviderIcons.value[popupContent.value.provider] ?? null : null,
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
  <div class="flex flex-col gap-8">
    <div
      v-if="methodsError"
      class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
      role="alert"
    >
      {{ i18nStore.t('errors.loadMethods') }}
    </div>
    <div
      v-else-if="!hasVisibleMethods && areMethodsLoading"
      class="flex justify-center py-12"
    >
      <span class="text-sm text-roadshop-primary/70">{{ i18nStore.t('loading.methods') }}</span>
    </div>
    <div
      v-else-if="!hasVisibleMethods"
      class="flex justify-center py-12"
    >
      <span class="text-sm text-roadshop-primary/70">{{ i18nStore.t('status.empty') }}</span>
    </div>
    <template v-else>
      <Section
        v-for="(entry, index) in localizedSections"
        :key="`${entry.section.category}-${index}`"
        :section="entry.section"
        :title="entry.title"
        @select="onSelectMethod"
      />
    </template>

    <DialogCloseFull
      v-if="popupContent && isNotMobilePopup"
      :visible="isPopupVisible"
      :title="popupContent.title"
      :description="popupContent.message"
      :close-label="popupContent.confirmLabel"
      @close="onPopupConfirm"
    >
      <div
        v-if="popupQrValue"
        class="mt-6 flex flex-col items-center gap-3"
      >
        <QrCodeDisplay :value="popupQrValue" :icon="popupQrIcon ?? undefined" />
        <p v-if="popupQrHint" class="text-center text-xs text-slate-500">
          {{ popupQrHint }}
          <i class="pi pi-camera"></i>
        </p>
      </div>
    </DialogCloseFull>
    <DialogCloseEnd
      v-else-if="popupContent"
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
