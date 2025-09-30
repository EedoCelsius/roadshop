import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { paymentMethods } from '@/payments/data/method'
import type { PaymentCategory, PaymentMethod } from '@/payments/types'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'

type PaymentMethodWithCurrencies = PaymentMethod & {
  supportedCurrencies: string[]
}

export const usePaymentStore = defineStore('payment', () => {
  const paymentInfoStore = usePaymentInfoStore()
  void paymentInfoStore.ensureLoaded()

  const resolveSupportedCurrencies = (method: PaymentMethod): string[] => {
    if (method.category !== 'GLOBAL') {
      return [method.category]
    }

    const methodInfo = paymentInfoStore.getMethodInfo(method.id)
    return methodInfo?.url ? Object.keys(methodInfo.url) : []
  }

  const methods = computed<PaymentMethodWithCurrencies[]>(() =>
    paymentMethods
      .map((method) => {
        const supportedCurrencies = resolveSupportedCurrencies(method)

        if (method.category === 'GLOBAL' && supportedCurrencies.length === 0) {
          return null
        }

        return {
          ...method,
          supportedCurrencies,
        }
      })
      .filter((method): method is PaymentMethodWithCurrencies => method !== null),
  )

  const methodsByCategory = computed<Record<PaymentCategory, PaymentMethodWithCurrencies[]>>(() =>
    methods.value.reduce(
      (groups, method) => {
        groups[method.category].push(method)
        return groups
      },
      {
        KRW: [],
        GLOBAL: [],
      } as Record<PaymentCategory, PaymentMethodWithCurrencies[]>,
    ),
  )

  const selectedMethodId = ref<string | null>(null)
  const selectedCurrency = ref<string | null>(null)
  const isCurrencySelectorOpen = ref(false)

  const findMethodById = (methodId: string): PaymentMethodWithCurrencies | null =>
    methods.value.find((method) => method.id === methodId) ?? null

  const selectedMethod = computed<PaymentMethodWithCurrencies | null>(() => {
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
    methodsByCategory,
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
