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

  const transferInfo = computed<TransferPaymentInfo | null>(() => info.value?.transfer ?? null)
  const tossInfo = computed<TossPaymentInfo | null>(() => info.value?.toss ?? null)
  const kakaoInfo = computed<KakaoPaymentInfo | null>(() => info.value?.kakao ?? null)

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
  }
})
