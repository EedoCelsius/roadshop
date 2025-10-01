import { ref } from 'vue'

import type { DeepLinkProvider } from '@/payments/types'
import type { KakaoPaymentInfo, TossPaymentInfo } from '@/payments/services/paymentInfoService'
import { isMobileDevice } from '@/shared/utils/device'

export const createTossDeepLink = (info: TossPaymentInfo): string => {
  const params = new URLSearchParams({
    amount: info.amount.krw.toString(),
    bank: info.bankName,
    accountNo: info.accountNo,
    origin: 'qr',
  })

  return `supertoss://send?${params.toString()}`
}

export const createKakaoDeepLink = (info: KakaoPaymentInfo): string => {
  const amount = info.amount.krw
  const personalCode = info.personalCode

  const hexAmount = Math.round(amount * 8).toString(16).toUpperCase()

  return `kakaotalk://kakaopay/money/to/qr?qr_code=281006011${personalCode}${hexAmount}0000`
}

const isTossInfo = (info: TossPaymentInfo | KakaoPaymentInfo): info is TossPaymentInfo =>
  'bankName' in info

export const resolveDeepLink = (
  provider: DeepLinkProvider,
  info: TossPaymentInfo | KakaoPaymentInfo | null,
): string => {
  if (!info) {
    throw new Error(`Missing payment info for provider: ${provider}`)
  }

  if (provider === 'toss') {
    if (!isTossInfo(info)) {
      throw new Error('Invalid payment info provided for Toss deep link')
    }

    return createTossDeepLink(info)
  }

  if (isTossInfo(info)) {
    throw new Error('Invalid payment info provided for Kakao deep link')
  }

  return createKakaoDeepLink(info)
}

let deepLinkLaunched = false
window.addEventListener('blur', () => { deepLinkLaunched = true })
document.addEventListener('visibilitychange', () => { if (document.hidden) { deepLinkLaunched = true } })

export const isDeepLinkChecking = ref(false)

interface LaunchDeepLinkOptions {
  timeoutMs: number
  onNotInstalled?: () => void
  onNotMobile?: () => void
}

export const launchDeepLink = async (
  url: string,
  {
    timeoutMs,
    onNotInstalled,
    onNotMobile,
  }: LaunchDeepLinkOptions,
) => {
  const isMobile = isMobileDevice()
  if (!isMobile) {
    onNotMobile?.()
    window.location.href = url
    return
  }

  isDeepLinkChecking.value = true
  const loadDelay = new Promise<void>((resolve) => {
    window.setTimeout(resolve, timeoutMs)
  })

  try {
    deepLinkLaunched = false
    window.location.href = url

    await loadDelay
    if (!deepLinkLaunched) {
      onNotInstalled?.()
    }
  } finally {
    isDeepLinkChecking.value = false
  }
}
