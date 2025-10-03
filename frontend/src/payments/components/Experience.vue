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
const methodFromRoute = computed(() => {
  const { method } = route.params

  return typeof method === 'string' ? method : null
})
const pendingRouteMethod = ref<string | null>(null)
const triggeredRouteMethod = ref<string | null>(null)

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

const navigateHome = () => {
  triggeredRouteMethod.value = pendingRouteMethod.value
  paymentStore.resetSelection()

  if (route.name !== 'home') {
    void router.replace({ name: 'home' })
  }
}

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

const tryRunMethodFromRoute = async () => {
  const methodId = pendingRouteMethod.value

  if (!methodId || triggeredRouteMethod.value === methodId) {
    return
  }

  const method = paymentStore.getMethodById(methodId)

  if (!method) {
    if (!areMethodsLoading.value) {
      triggeredRouteMethod.value = methodId
      navigateHome()
    }

    return
  }

  triggeredRouteMethod.value = methodId
  paymentStore.selectMethod(methodId)

  if (!isCurrencySelectorOpen.value) {
    await runWorkflowForMethod(method, selectedCurrency.value)
  }
}

watch(
  methodFromRoute,
  (method) => {
    pendingRouteMethod.value = method

    if (!method) {
      triggeredRouteMethod.value = null
      paymentStore.resetSelection()
      return
    }

    if (triggeredRouteMethod.value !== method) {
      triggeredRouteMethod.value = null
    }

    void tryRunMethodFromRoute()
  },
  { immediate: true },
)

watch(
  () => methods.value.length,
  () => {
    void tryRunMethodFromRoute()
  },
)

watch(areMethodsLoading, (loading) => {
  if (!loading) {
    void tryRunMethodFromRoute()
  }
})

const onSelectMethod = (methodId: string) => {
  if (methodFromRoute.value !== methodId) {
    void router.replace({ name: 'payment-method', params: { method: methodId } })
    return
  }

  pendingRouteMethod.value = methodId
  triggeredRouteMethod.value = null

  void tryRunMethodFromRoute()
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
  navigateHome()
}

const onDialogClose = () => {
  navigateHome()
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
    <TransferExperience ref="transferExperienceRef" @close="onDialogClose" />
    <TossExperience ref="tossExperienceRef" @close="onDialogClose" />
    <KakaoExperience ref="kakaoExperienceRef" @close="onDialogClose" />
    <LoadingOverlay
      :visible="isDeepLinkChecking"
      :message="i18nStore.t('status.loading.deepLink')"
    />
  </div>
</template>
