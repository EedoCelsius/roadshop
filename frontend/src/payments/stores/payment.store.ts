import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { paymentMethods } from '@/payments/data/method'
import type { PaymentCurrency, PaymentMethod } from '@/payments/types'

export const usePaymentStore = defineStore('payment', () => {
  const methods = ref<PaymentMethod[]>([...paymentMethods])

  const methodsByCurrency = computed(() => {
    const grouped: Record<PaymentCurrency, PaymentMethod[]> = {
      KRW: [],
      GLOBAL: [],
    }

    methods.value.forEach((method) => {
      grouped[method.currency].push(method)
    })

    return grouped
  })

  const getUrlForMethod = (methodId: string, currency?: string | null): string | null => {
    const method = methods.value.find((item) => item.id === methodId)

    if (!method) {
      return null
    }

    if (currency && method.urlsByCurrency?.[currency]) {
      return method.urlsByCurrency[currency]
    }

    return method.url ?? null
  }

  const selectedMethodId = ref<string | null>(null)
  const selectedCurrency = ref<string | null>(null)
  const isCurrencySelectorOpen = ref(false)

  const selectedMethod = computed(() =>
    selectedMethodId.value ? methods.value.find((method) => method.id === selectedMethodId.value) ?? null : null,
  )

  const selectMethod = (methodId: string): void => {
    const method = methods.value.find((item) => item.id === methodId)

    if (!method) {
      return
    }

    selectedMethodId.value = methodId

    if (method.supportedCurrencies.length <= 1) {
      const currency = method.supportedCurrencies[0] ?? null
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
    getUrlForMethod,
    getMethodById,
  }
})
