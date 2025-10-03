<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'

import LoadingOverlay from '@/shared/components/LoadingOverlay.vue'
import CurrencySelectorDialog from '@/payments/components/CurrencySelectorDialog.vue'
import Section from '@/payments/components/Section.vue'
import KakaoExperience from '@/payments/components/kakao/KakaoExperience.vue'
import TossExperience from '@/payments/components/toss/TossExperience.vue'
import TransferExperience from '@/payments/components/transfer/TransferExperience.vue'
import { useLocalizedSections } from '@/payments/composables/useLocalizedSections'
import { usePaymentStore } from '@/payments/stores/payment.store'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'
import { useI18nStore } from '@/localization/store'
import { isDeepLinkChecking } from '@/payments/services/deepLinkService'
import { openUrlInNewTab } from '@/shared/utils/navigation'
import type { PaymentCategory, PaymentMethodWithCurrencies } from '@/payments/types'

defineOptions({
  name: 'PaymentExperience',
})

type DialogRoute = 'kakao' | 'toss' | 'transfer'

const paymentStore = usePaymentStore()
const paymentInfoStore = usePaymentInfoStore()
const i18nStore = useI18nStore()
const router = useRouter()
const route = useRoute()

const { methods, selectedMethod, selectedCurrency, isCurrencySelectorOpen, isLoading: areMethodsLoading, error: methodsError } =
  storeToRefs(paymentStore)

const tossExperienceRef = ref<InstanceType<typeof TossExperience> | null>(null)
const kakaoExperienceRef = ref<InstanceType<typeof KakaoExperience> | null>(null)
const transferExperienceRef = ref<InstanceType<typeof TransferExperience> | null>(null)

const requestedDialog = computed<DialogRoute | null>(() => {
  const dialogParam = route.params.dialog

  if (Array.isArray(dialogParam)) {
    return dialogParam[0] as DialogRoute
  }

  return (dialogParam as DialogRoute | undefined) ?? null
})

let lastOpenedDialog: DialogRoute | null = null

const selectMethodForDialog = (dialog: DialogRoute) => {
  if (paymentStore.selectedMethodId !== dialog) {
    paymentStore.selectMethod(dialog)
  }
}

const openDialogForRoute = async (dialog: DialogRoute | null): Promise<boolean> => {
  if (!dialog) {
    return false
  }

  selectMethodForDialog(dialog)

  switch (dialog) {
    case 'kakao':
      return (await kakaoExperienceRef.value?.openNotMobileDialog()) ?? false
    case 'toss':
      return (await tossExperienceRef.value?.openInstructionDialog()) ?? false
    case 'transfer':
      return (await transferExperienceRef.value?.openDialog()) ?? false
    default:
      return false
  }
}

const navigateHome = () => {
  lastOpenedDialog = null

  if (requestedDialog.value) {
    void router.push('/')
  }
}

watch(
  requestedDialog,
  async (dialog) => {
    if (!dialog) {
      lastOpenedDialog = null
      return
    }

    if (lastOpenedDialog === dialog) {
      return
    }

    const opened = await openDialogForRoute(dialog)

    if (opened) {
      lastOpenedDialog = dialog
    }
  },
  { immediate: true },
)

watch(
  methods,
  () => {
    const dialog = requestedDialog.value

    if (!dialog) {
      return
    }

    selectMethodForDialog(dialog)
  },
  { immediate: false },
)

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

const openMethodUrl = async (method: PaymentMethodWithCurrencies, currency: string | null) => {
  const ready = await paymentInfoStore.ensureMethodInfo(method.id)

  if (!ready) {
    return
  }

  const url = paymentInfoStore.getMethodUrl(method.id, currency ?? undefined)

  if (url) {
    openUrlInNewTab(url)
  }
}

const runWorkflowForMethod = async (method: PaymentMethodWithCurrencies, currency: string | null) => {
  switch (method.id) {
    case 'transfer':
      await transferExperienceRef.value?.run()
      break
    case 'toss':
      await tossExperienceRef.value?.run()
      break
    case 'kakao':
      await kakaoExperienceRef.value?.run()
      break
    default:
      await openMethodUrl(method, currency)
  }
}

const onSelectMethod = (methodId: string) => {
  paymentStore.selectMethod(methodId)

  const method = paymentStore.getMethodById(methodId)

  if (!method || isCurrencySelectorOpen.value) {
    return
  }

  void runWorkflowForMethod(method, selectedCurrency.value)
}

const onCurrencySelect = (currency: string) => {
  paymentStore.chooseCurrency(currency)

  if (selectedCurrency.value !== currency) {
    return
  }

  const method = selectedMethod.value

  if (!method) {
    return
  }

  void runWorkflowForMethod(method, currency)
}

const onCloseCurrencySelector = () => {
  paymentStore.closeCurrencySelector()
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
      <span class="text-sm text-brand-primary/70">{{ i18nStore.t('status.loading.methods') }}</span>
    </div>
    <div
      v-else-if="!hasVisibleMethods"
      class="flex justify-center py-12"
    >
      <span class="text-sm text-brand-primary/70">{{ i18nStore.t('status.empty') }}</span>
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

    <CurrencySelectorDialog
      v-if="selectedMethod && isCurrencySelectorOpen"
      :method-name="selectedMethodName"
      :currencies="selectedMethodCurrencies"
      @select="onCurrencySelect"
      @close="onCloseCurrencySelector"
    />
    <TransferExperience ref="transferExperienceRef" @close="navigateHome" />
    <TossExperience ref="tossExperienceRef" @close="navigateHome" />
    <KakaoExperience ref="kakaoExperienceRef" @close="navigateHome" />
    <LoadingOverlay
      :visible="isDeepLinkChecking"
      :message="i18nStore.t('status.loading.deepLink')"
    />
  </div>
</template>
