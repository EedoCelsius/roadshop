<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'

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

interface RouteCandidate {
  methodId: string
  basePath: string
}

defineOptions({
  name: 'PaymentExperience',
})

const paymentStore = usePaymentStore()
const paymentInfoStore = usePaymentInfoStore()
const i18nStore = useI18nStore()

const { methods, selectedMethod, selectedCurrency, isCurrencySelectorOpen, isLoading: areMethodsLoading, error: methodsError } =
  storeToRefs(paymentStore)

const tossExperienceRef = ref<InstanceType<typeof TossExperience> | null>(null)
const kakaoExperienceRef = ref<InstanceType<typeof KakaoExperience> | null>(null)
const transferExperienceRef = ref<InstanceType<typeof TransferExperience> | null>(null)

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
    return false
  }

  const url = paymentInfoStore.getMethodUrl(method.id, currency ?? undefined)

  if (!url) {
    return false
  }

  openUrlInNewTab(url)
  return true
}

const runWorkflowForMethod = async (
  method: PaymentMethodWithCurrencies,
  currency: string | null,
): Promise<boolean> => {
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

const resolveRouteCandidate = (): RouteCandidate | null => {
  const { pathname, search, hash } = window.location
  const normalizedPathname = pathname.replace(/\/+$/, '') || '/'
  const segments = normalizedPathname.split('/').filter(Boolean)

  if (!segments.length) {
    return null
  }

  const methodId = segments[segments.length - 1]
  const baseSegments = segments.slice(0, -1)
  const basePathname = baseSegments.length ? `/${baseSegments.join('/')}` : '/'

  return {
    methodId,
    basePath: `${basePathname}${search}${hash}` || '/',
  }
}

const pendingRoute = ref<RouteCandidate | null>(null)
const routeState = ref<RouteCandidate | null>(null)
const isHandlingRoute = ref(false)

const restoreRoutePath = () => {
  if (!routeState.value) {
    return
  }

  const basePath = routeState.value.basePath || '/'
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`

  if (current !== basePath) {
    window.history.replaceState(null, '', basePath)
  } else {
    window.history.replaceState(null, '', basePath)
  }

  pendingRoute.value = null
  routeState.value = null
}

const tryHandlePendingRoute = async () => {
  if (!pendingRoute.value || isHandlingRoute.value) {
    return
  }

  const candidate = pendingRoute.value
  const method = paymentStore.getMethodById(candidate.methodId)

  if (!method) {
    if (!areMethodsLoading.value && methods.value.length > 0) {
      const isValidMethod = methods.value.some((entry) => entry.id === candidate.methodId)

      if (!isValidMethod) {
        pendingRoute.value = null
      }
    }

    return
  }

  isHandlingRoute.value = true
  routeState.value = candidate
  pendingRoute.value = null

  try {
    const defaultCurrency = method.supportedCurrencies[0] ?? null
    const succeeded = await runWorkflowForMethod(method, defaultCurrency)

    if (!succeeded) {
      restoreRoutePath()
    }
  } finally {
    isHandlingRoute.value = false
  }
}

const updateRouteFromLocation = () => {
  const candidate = resolveRouteCandidate()

  if (!candidate || candidate.methodId !== routeState.value?.methodId) {
    routeState.value = null
  }

  pendingRoute.value = candidate
  void tryHandlePendingRoute()
}

onMounted(() => {
  updateRouteFromLocation()
  window.addEventListener('popstate', updateRouteFromLocation)
})

onBeforeUnmount(() => {
  window.removeEventListener('popstate', updateRouteFromLocation)
})

watch(
  () => methods.value.length,
  () => {
    void tryHandlePendingRoute()
  },
)

watch(
  () => pendingRoute.value,
  () => {
    void tryHandlePendingRoute()
  },
)

const onMethodExperienceClose = (methodId: string) => {
  if (routeState.value?.methodId !== methodId) {
    return
  }

  restoreRoutePath()
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
    <TransferExperience ref="transferExperienceRef" @close="onMethodExperienceClose('transfer')" />
    <TossExperience ref="tossExperienceRef" @close="onMethodExperienceClose('toss')" />
    <KakaoExperience ref="kakaoExperienceRef" @close="onMethodExperienceClose('kakao')" />
    <LoadingOverlay
      :visible="isDeepLinkChecking"
      :message="i18nStore.t('status.loading.deepLink')"
    />
  </div>
</template>
