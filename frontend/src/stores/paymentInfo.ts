import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { DeepLinkProvider } from './payment'

type TransferAccount = {
  bank: string
  number: string
  holder: string
}

type AmountKRW = {
  krw: number
}

export type TransferPaymentInfo = {
  amount: AmountKRW
  account: TransferAccount[]
}

export type TossPaymentInfo = {
  amount: AmountKRW
  bankName: string
  accountNo: string
}

export type KakaoPaymentInfo = {
  amount: AmountKRW
  personalCode: string
}

export type PaymentInfo = {
  transfer: TransferPaymentInfo
  toss: TossPaymentInfo
  kakao: KakaoPaymentInfo
}

const PAYMENT_INFO_ENDPOINT = `${import.meta.env.BASE_URL}config/info.json`

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
        const response = await fetch(PAYMENT_INFO_ENDPOINT, { cache: 'no-store' })

        if (!response.ok) {
          throw new Error(`Failed to fetch payment info: ${response.status}`)
        }

        const payload = (await response.json()) as PaymentInfo
        info.value = payload
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

  const transferInfo = computed(() => info.value?.transfer ?? null)
  const tossInfo = computed(() => info.value?.toss ?? null)
  const kakaoInfo = computed(() => info.value?.kakao ?? null)

  const getDeepLinkInfo = (provider: DeepLinkProvider): TossPaymentInfo | KakaoPaymentInfo | null => {
    if (provider === 'toss') {
      return tossInfo.value
    }

    if (provider === 'kakao') {
      return kakaoInfo.value
    }

    return null
  }

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
