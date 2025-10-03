<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
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

const paymentStore = usePaymentStore()
const paymentInfoStore = usePaymentInfoStore()
const i18nStore = useI18nStore()

const { methods, selectedMethod, selectedCurrency, isCurrencySelectorOpen, isLoading: areMethodsLoading, error: methodsError } =
  storeToRefs(paymentStore)

const router = useRouter()
const route = useRoute()

const tossExperienceRef = ref<InstanceType<typeof TossExperience> | null>(null)
const kakaoExperienceRef = ref<InstanceType<typeof KakaoExperience> | null>(null)
const transferExperienceRef = ref<InstanceType<typeof TransferExperience> | null>(null)

const dialogRouteMethods = new Set(['kakao', 'toss', 'transfer'])

const currentRouteMethod = computed(() => {
  const param = route.params.method

  if (!param) {
    return null
  }

  if (Array.isArray(param)) {
    return param[0] ?? null
  }

  return typeof param === 'string' ? param : null
})

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

const openMethodUrl = async (method: PaymentMethodWithCurrencies, currency: string | null): Promise<boolean> => {
  const ready = await paymentInfoStore.ensureMethodInfo(method.id)

  if (!ready) {
    return false
  }

  const url = paymentInfoStore.getMethodUrl(method.id, currency ?? undefined)

  if (url) {
    openUrlInNewTab(url)
    return true
  }

  return false
}

const runWorkflowForMethod = async (method: PaymentMethodWithCurrencies, currency: string | null): Promise<boolean> => {
  switch (method.id) {
    case 'transfer':
      return (await transferExperienceRef.value?.run()) ?? false
    case 'toss':
      return (await tossExperienceRef.value?.run()) ?? false
    case 'kakao':
      return (await kakaoExperienceRef.value?.run()) ?? false
    default:
      return await openMethodUrl(method, currency)
  }

  return false
}

const goHome = async () => {
  if (currentRouteMethod.value) {
    await router.replace({ name: 'home' })
  }
}

let lastHandledRouteMethod: string | null = null
let isHandlingRouteDialog = false
let shouldRetryRouteHandling = false

const finalizeRouteHandling = () => {
  isHandlingRouteDialog = false

  if (shouldRetryRouteHandling) {
    shouldRetryRouteHandling = false
    void handleRouteDialog()
  }
}

const handleRouteDialog = async () => {
  if (isHandlingRouteDialog) {
    shouldRetryRouteHandling = true
    return
  }

  isHandlingRouteDialog = true

  const methodId = currentRouteMethod.value

  if (!methodId) {
    lastHandledRouteMethod = null
    finalizeRouteHandling()
    return
  }

  if (areMethodsLoading.value) {
    finalizeRouteHandling()
    return
  }

  if (!dialogRouteMethods.has(methodId)) {
    await goHome()
    finalizeRouteHandling()
    return
  }

  const method = paymentStore.getMethodById(methodId)

  if (!method) {
    if (!methods.value.length && !methodsError.value) {
      finalizeRouteHandling()
      return
    }

    await goHome()
    finalizeRouteHandling()
    return
  }

  if (lastHandledRouteMethod === methodId && !isCurrencySelectorOpen.value) {
    finalizeRouteHandling()
    return
  }

  paymentStore.selectMethod(methodId)
  lastHandledRouteMethod = methodId

  await nextTick()

  if (isCurrencySelectorOpen.value && !selectedCurrency.value) {
    finalizeRouteHandling()
    return
  }

  const wasSuccessful = await runWorkflowForMethod(method, selectedCurrency.value)

  if (!wasSuccessful) {
    await goHome()
  }

  finalizeRouteHandling()
}

watch(
  [currentRouteMethod, () => areMethodsLoading.value, () => methods.value.length, () => methodsError.value],
  () => {
    void handleRouteDialog()
  },
  { immediate: true },
)

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

  void goHome()
}

const onDialogClosed = () => {
  void goHome()
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
    <TransferExperience ref="transferExperienceRef" @closed="onDialogClosed" />
    <TossExperience ref="tossExperienceRef" @closed="onDialogClosed" />
    <KakaoExperience ref="kakaoExperienceRef" @closed="onDialogClosed" />
    <LoadingOverlay
      :visible="isDeepLinkChecking"
      :message="i18nStore.t('status.loading.deepLink')"
    />
  </div>
</template>
