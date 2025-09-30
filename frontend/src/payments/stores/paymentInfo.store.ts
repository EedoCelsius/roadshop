import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { DeepLinkProvider } from '@/payments/types'
import {
  loadPaymentInfo,
  resolveDeepLinkPayload,
  type PaymentInfo,
  type TransferPaymentInfo,
  type TossPaymentInfo,
  type KakaoPaymentInfo,
  type MethodUrlInfo,
} from '@/payments/services/paymentInfoService'

let pendingRequest: Promise<boolean> | null = null

export const usePaymentInfoStore = defineStore('payment-info', () => {
  const info = ref<PaymentInfo | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchPaymentInfo = async (): Promise<boolean> => {
    if (pendingRequest) {
      return pendingRequest
    }

    pendingRequest = (async () => {
      isLoading.value = true
      error.value = null

      try {
        info.value = await loadPaymentInfo()
        return true
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Unknown error occurred'
        return false
      } finally {
        isLoading.value = false
        pendingRequest = null
      }
    })()

    return pendingRequest
  }

  const ensureLoaded = async (): Promise<boolean> => {
    if (info.value) {
      return true
    }

    return fetchPaymentInfo()
  }

  const transferInfo = computed<TransferPaymentInfo | null>(() => {
    const payload = info.value?.transfer
    return payload ? (payload as TransferPaymentInfo) : null
  })

  const tossInfo = computed<TossPaymentInfo | null>(() => {
    const payload = info.value?.toss
    return payload ? (payload as TossPaymentInfo) : null
  })

  const kakaoInfo = computed<KakaoPaymentInfo | null>(() => {
    const payload = info.value?.kakao
    return payload ? (payload as KakaoPaymentInfo) : null
  })

  const getPayload = (methodId: string): unknown => info.value?.[methodId] ?? null

  const isMethodUrlInfo = (payload: unknown): payload is MethodUrlInfo =>
    typeof payload === 'object' &&
    payload !== null &&
    'url' in payload &&
    typeof (payload as { url?: unknown }).url === 'object' &&
    (payload as { url?: unknown }).url !== null

  const hasMethodPayload = (methodId: string): boolean => getPayload(methodId) !== null

  const getMethodInfo = (methodId: string): MethodUrlInfo | null => {
    const payload = getPayload(methodId)
    return isMethodUrlInfo(payload) ? payload : null
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

  const getDeepLinkInfo = (provider: DeepLinkProvider): TossPaymentInfo | KakaoPaymentInfo | null =>
    resolveDeepLinkPayload(info.value, provider)

  return {
    info,
    isLoading,
    error,
    transferInfo,
    tossInfo,
    kakaoInfo,
    ensureLoaded,
    fetchPaymentInfo,
    getDeepLinkInfo,
    getMethodInfo,
    getMethodUrl,
    hasMethodPayload,
  }
})
