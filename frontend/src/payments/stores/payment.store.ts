import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { paymentMethods } from '@/payments/data/method'
import type { PaymentCurrency, PaymentMethod } from '@/payments/types'
import { usePaymentInfoStore } from '@/payments/stores/paymentInfo.store'

type PaymentMethodWithCurrencies = PaymentMethod & {
  supportedCurrencies: string[]
}

export const usePaymentStore = defineStore('payment', () => {
  const paymentInfoStore = usePaymentInfoStore()
  void paymentInfoStore.ensureLoaded()

  const methods = ref<PaymentMethod[]>([...paymentMethods])

  const resolveSupportedCurrencies = (method: PaymentMethod): string[] => {
    if (method.currency !== 'GLOBAL') {
      return [method.currency]
    }

    const methodInfo = paymentInfoStore.getMethodInfo(method.id)

    if (!methodInfo?.url) {
      return []
    }

    return Object.keys(methodInfo.url)
  }

  const methodsByCurrency = computed<Record<PaymentCurrency, PaymentMethodWithCurrencies[]>>(() => {
    const grouped: Record<PaymentCurrency, PaymentMethodWithCurrencies[]> = {
      KRW: [],
      GLOBAL: [],
    }

    methods.value.forEach((method) => {
      const supportedCurrencies = resolveSupportedCurrencies(method)

      if (method.currency === 'GLOBAL' && supportedCurrencies.length === 0) {
        return
      }

      grouped[method.currency].push({
        ...method,
        supportedCurrencies,
      })
    })

    return grouped
  })

  const selectedMethodId = ref<string | null>(null)
  const selectedCurrency = ref<string | null>(null)
  const isCurrencySelectorOpen = ref(false)

  const selectedMethod = computed<PaymentMethodWithCurrencies | null>(() => {
    if (!selectedMethodId.value) {
      return null
    }

    const method = methods.value.find((item) => item.id === selectedMethodId.value)

    if (!method) {
      return null
    }

    const supportedCurrencies = resolveSupportedCurrencies(method)

    if (method.currency === 'GLOBAL' && supportedCurrencies.length === 0) {
      return null
    }

    return {
      ...method,
      supportedCurrencies,
    }
  })

  const selectMethod = (methodId: string): void => {
    const method = methods.value.find((item) => item.id === methodId)

    if (!method) {
      return
    }

    selectedMethodId.value = methodId

    const supportedCurrencies = resolveSupportedCurrencies(method)

    if (supportedCurrencies.length <= 1) {
      const currency = supportedCurrencies[0] ?? null
      selectedCurrency.value = currency
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

  const getMethodById = (methodId: string): PaymentMethod | null =>
    methods.value.find((method) => method.id === methodId) ?? null

  const getSupportedCurrencies = (methodId: string): string[] => {
    const method = methods.value.find((item) => item.id === methodId)

    return method ? resolveSupportedCurrencies(method) : []
  }

  return {
    methods,
    methodsByCurrency,
    selectedMethodId,
    selectedMethod,
    selectedCurrency,
    isCurrencySelectorOpen,
    selectMethod,
    chooseCurrency,
    closeCurrencySelector,
    getMethodById,
    getSupportedCurrencies,
  }
})
