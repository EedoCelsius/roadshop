import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { DeepLinkProvider } from '@/payments/types'
import {
  fetchPaymentMethodDetail,
  type KakaoPaymentInfo,
  type MethodUrlInfo,
  type PaymentMethodDetail,
  type StripePaymentInfo,
  type TossPaymentInfo,
  type TransferPaymentInfo,
} from '@/payments/services/paymentInfoService'

const pendingRequests = new Map<string, Promise<boolean>>()

const cloneRecord = <T>(record: Record<string, T>, key: string, value: T): Record<string, T> => ({
  ...record,
  [key]: value,
})

export const usePaymentInfoStore = defineStore('payment-info', () => {
  const details = ref<Record<string, PaymentMethodDetail | undefined>>({})
  const loadingState = ref<Record<string, boolean>>({})
  const errors = ref<Record<string, string | null>>({})

  const setLoading = (methodId: string, value: boolean) => {
    loadingState.value = cloneRecord(loadingState.value, methodId, value)
  }

  const setError = (methodId: string, value: string | null) => {
    errors.value = cloneRecord(errors.value, methodId, value)
  }

  const setDetail = (methodId: string, detail: PaymentMethodDetail | undefined) => {
    details.value = cloneRecord(details.value, methodId, detail)
  }

  const fetchMethodInfo = async (methodId: string): Promise<boolean> => {
    if (pendingRequests.has(methodId)) {
      return pendingRequests.get(methodId) as Promise<boolean>
    }

    const request = (async () => {
      setLoading(methodId, true)
      setError(methodId, null)

      try {
        const detail = await fetchPaymentMethodDetail(methodId)
        setDetail(methodId, detail)
        return true
      } catch (err) {
        setDetail(methodId, undefined)
        setError(methodId, err instanceof Error ? err.message : 'Unknown error occurred')
        return false
      } finally {
        setLoading(methodId, false)
        pendingRequests.delete(methodId)
      }
    })()

    pendingRequests.set(methodId, request)
    return request
  }

  const ensureMethodInfo = async (methodId: string): Promise<boolean> => {
    if (details.value[methodId]) {
      return true
    }

    return fetchMethodInfo(methodId)
  }

  const getDetail = (methodId: string): PaymentMethodDetail | null => details.value[methodId] ?? null

  const transferInfo = computed<TransferPaymentInfo | null>(() => {
    const detail = details.value.transfer
    return detail && detail.type === 'transfer' ? detail.data : null
  })

  const tossInfo = computed<TossPaymentInfo | null>(() => {
    const detail = details.value.toss
    return detail && detail.type === 'toss' ? detail.data : null
  })

  const kakaoInfo = computed<KakaoPaymentInfo | null>(() => {
    const detail = details.value.kakao
    return detail && detail.type === 'kakao' ? detail.data : null
  })

  const stripeCardInfo = computed<StripePaymentInfo | null>(() => {
    const detail = details.value.card
    return detail && detail.type === 'stripe' ? detail.data : null
  })

  const getMethodInfo = (methodId: string): MethodUrlInfo | null => {
    const detail = getDetail(methodId)
    return detail && detail.type === 'url' ? detail.data : null
  }

  const getMethodUrl = (methodId: string, currency?: string | null): string | null => {
    const methodInfo = getMethodInfo(methodId)

    if (!methodInfo?.url) {
      return null
    }

    const normalizedCurrency = currency?.toUpperCase() ?? null

    if (normalizedCurrency && methodInfo.url[normalizedCurrency]) {
      return methodInfo.url[normalizedCurrency]
    }

    const [firstUrl] = Object.values(methodInfo.url)
    return firstUrl ?? null
  }

  const getDeepLinkInfo = (provider: DeepLinkProvider): TossPaymentInfo | KakaoPaymentInfo | null => {
    if (provider === 'toss') {
      return tossInfo.value
    }

    if (provider === 'kakao') {
      return kakaoInfo.value
    }

    return null
  }

  const isMethodLoading = (methodId: string): boolean => Boolean(loadingState.value[methodId])

  return {
    details,
    loadingState,
    errors,
    transferInfo,
    tossInfo,
    kakaoInfo,
    stripeCardInfo,
    ensureMethodInfo,
    fetchMethodInfo,
    getDeepLinkInfo,
    getMethodInfo,
    getMethodUrl,
    isMethodLoading,
    getDetail,
  }
})
