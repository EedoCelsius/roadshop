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
  isDialogVisible,
  dialogContent,
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
  sections.value.map((section) => {
    const categoryKey = section.category.toLowerCase()

    return {
      section,
      title: i18nStore.t(`category.${categoryKey}`),
    }
  }),
)

const hasVisibleMethods = computed(() =>
  localizedSections.value.some((entry) => entry.section.methods.length > 0),
)

const selectedMethodName = computed(() =>
  selectedMethod.value ? i18nStore.t(`options.${selectedMethod.value.id}`) : '',
)

const selectedMethodCurrencies = computed(() => selectedMethod.value?.supportedCurrencies ?? [])

const isNotMobileDialog = computed(() => dialogContent.value?.type === 'not-mobile')
const dialogQrValue = computed(() => dialogContent.value?.deepLinkUrl ?? null)
const dialogQrHint = computed(() => {
  if (!dialogContent.value?.deepLinkUrl) {
    return null
  }

  const typeKey =
    dialogContent.value.type === 'not-mobile'
      ? 'dialogs.notMobile.qrHint'
      : 'dialogs.notInstalled.qrHint'

  const candidateKeys = [typeKey, 'dialogs.notInstalled.qrHint']

  for (const key of candidateKeys) {
    const template = i18nStore.t(key)

    if (template === key) {
      continue
    }

    const methodLabel = i18nStore.t(
      `options.${dialogContent.value.provider}`,
      dialogContent.value.provider,
    )

    return template.split('{method}').join(methodLabel)
  }

  return null
})
const deepLinkProviderIcons = computed(() =>
  methods.value.reduce<Partial<Record<DeepLinkProvider, PaymentIcon>>>((map, method) => {
    if (method.deepLinkProvider && method.icons?.[0]) {
      map[method.deepLinkProvider] = method.icons[0]
    }

    return map
  }, {}),
)
const dialogQrIcon = computed(() =>
  dialogContent.value ? deepLinkProviderIcons.value[dialogContent.value.provider] ?? null : null,
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

const onDialogConfirm = () => {
  paymentInteractionStore.closeDialog()
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
      {{ i18nStore.t('status.errors.loadMethods') }}
    </div>
    <div
      v-else-if="!hasVisibleMethods && areMethodsLoading"
      class="flex justify-center py-12"
    >
      <span class="text-sm text-roadshop-primary/70">{{ i18nStore.t('status.loading.methods') }}</span>
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
      v-if="dialogContent && isNotMobileDialog"
      :visible="isDialogVisible"
      :title="dialogContent.title"
      :description="dialogContent.message"
      :close-label="dialogContent.confirmLabel"
      @close="onDialogConfirm"
    >
      <div
        v-if="dialogQrValue"
        class="mt-6 flex flex-col items-center gap-3"
      >
        <QrCodeDisplay :value="dialogQrValue" :icon="dialogQrIcon ?? undefined" />
        <p v-if="dialogQrHint" class="text-center text-xs text-slate-500">
          {{ dialogQrHint }}
          <i class="pi pi-camera"></i>
        </p>
      </div>
    </DialogCloseFull>
    <DialogCloseEnd
      v-else-if="dialogContent"
      :visible="isDialogVisible"
      :title="dialogContent.title"
      :description="dialogContent.message"
      :close-label="dialogContent.confirmLabel"
      @close="onDialogConfirm"
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
    <LoadingOverlay
      :visible="isDeepLinkChecking"
      :message="i18nStore.t('status.loading.deepLink')"
    />
  </div>
</template>
