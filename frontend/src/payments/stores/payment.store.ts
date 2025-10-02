import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getMethodIcons } from '@icons/methods'
import type { PaymentMethod, PaymentMethodWithCurrencies } from '@/payments/types'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'

const basePaymentMethods: PaymentMethod[] = [
  { id: 'transfer', icons: getMethodIcons('transfer') },
  { id: 'toss', icons: getMethodIcons('toss'), deepLinkProvider: 'toss' },
  { id: 'kakao', icons: getMethodIcons('kakao'), deepLinkProvider: 'kakao' },
  { id: 'naver', icons: getMethodIcons('naver') },
  { id: 'alipay', icons: getMethodIcons('alipay') },
  { id: 'paypal', icons: getMethodIcons('paypal') },
  { id: 'card', icons: getMethodIcons('card') },
]

type PaymentMethodWithState = PaymentMethodWithCurrencies

export const usePaymentStore = defineStore('payment', () => {
  const paymentInfoStore = usePaymentInfoStore()
  void paymentInfoStore.ensureLoaded()

  const resolveSupportedCurrencies = (methodId: string): string[] => {
    const methodInfo = paymentInfoStore.getMethodInfo(methodId)

    if (methodInfo?.url) {
      const currencies = Object.keys(methodInfo.url)
      return currencies.length ? currencies : ['KRW']
    }

    return ['KRW']
  }

  const methods = computed<PaymentMethodWithState[]>(() =>
    basePaymentMethods
      .map((method) => {
        if (!paymentInfoStore.hasMethodPayload(method.id)) {
          return null
        }

        const supportedCurrencies = resolveSupportedCurrencies(method.id)

        if (supportedCurrencies.length === 0) {
          return null
        }

        return {
          ...method,
          supportedCurrencies,
        }
      })
      .filter((method): method is PaymentMethodWithState => method !== null),
  )

  const selectedMethodId = ref<string | null>(null)
  const selectedCurrency = ref<string | null>(null)
  const isCurrencySelectorOpen = ref(false)

  const findMethodById = (methodId: string): PaymentMethodWithState | null =>
    methods.value.find((method) => method.id === methodId) ?? null

  const selectedMethod = computed<PaymentMethodWithState | null>(() => {
    if (!selectedMethodId.value) {
      return null
    }

    return findMethodById(selectedMethodId.value)
  })

  const selectMethod = (methodId: string): void => {
    const method = findMethodById(methodId)

    if (!method) {
      selectedMethodId.value = null
      selectedCurrency.value = null
      isCurrencySelectorOpen.value = false
      return
    }

    selectedMethodId.value = methodId

    if (method.supportedCurrencies.length <= 1) {
      selectedCurrency.value = method.supportedCurrencies[0] ?? null
      isCurrencySelectorOpen.value = false
      return
    }

    selectedCurrency.value = null
    isCurrencySelectorOpen.value = true
  }

  const chooseCurrency = (currency: string): void => {
    const method = selectedMethod.value

    if (!method || !method.supportedCurrencies.includes(currency)) {
      return
    }

    selectedCurrency.value = currency
    isCurrencySelectorOpen.value = false
  }

  const closeCurrencySelector = () => {
    isCurrencySelectorOpen.value = false
  }

  return {
    methods,
    selectedMethodId,
    selectedMethod,
    selectedCurrency,
    isCurrencySelectorOpen,
    selectMethod,
    chooseCurrency,
    closeCurrencySelector,
    getMethodById: findMethodById,
    getSupportedCurrencies: (methodId: string) =>
      findMethodById(methodId)?.supportedCurrencies ?? [],
  }
})
