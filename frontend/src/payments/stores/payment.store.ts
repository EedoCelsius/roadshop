import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getMethodIcons } from '@icons/methods'
import type { PaymentMethodWithCurrencies } from '@/payments/types'
import {
  fetchAvailablePaymentMethods,
  type AvailablePaymentMethod,
} from '@/payments/services/paymentInfoService'

type PaymentMethodWithState = PaymentMethodWithCurrencies

export const usePaymentStore = defineStore('payment', () => {
  const methods = ref<PaymentMethodWithState[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const mapAvailableMethod = (entry: AvailablePaymentMethod): PaymentMethodWithState | null => {
    if (!entry.supportedCurrencies.length) {
      return null
    }

    const icons = getMethodIcons(entry.id)

    return {
      id: entry.id,
      icons,
      deepLinkProvider: entry.deepLinkProvider,
      supportedCurrencies: entry.supportedCurrencies,
    }
  }

  const loadMethods = async () => {
    isLoading.value = true
    error.value = null

    try {
      const availableMethods = await fetchAvailablePaymentMethods()
      methods.value = availableMethods
        .map(mapAvailableMethod)
        .filter((method): method is PaymentMethodWithState => method !== null)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load payment methods'
      methods.value = []
    } finally {
      isLoading.value = false
    }
  }

  void loadMethods()

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
    isLoading,
    error,
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
    reload: loadMethods,
  }
})
