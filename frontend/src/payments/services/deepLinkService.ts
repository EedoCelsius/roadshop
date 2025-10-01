import { ref } from 'vue'

import type { DeepLinkProvider } from '@/payments/types'
import type { KakaoPaymentInfo, TossPaymentInfo } from '@/payments/services/paymentInfoService'

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

let deepLinkPromiseResolver: (value: boolean) => void = () => {}
window.addEventListener('blur', () => { deepLinkPromiseResolver(true) })
document.addEventListener('visibilitychange', () => { if (document.hidden) { deepLinkPromiseResolver(true) } })

export const waitForDeepLinkLaunch = (timeoutMs = 1500): Promise<boolean> => {
  return new Promise<boolean>((resolve) => {
    deepLinkPromiseResolver = resolve
    window.setTimeout(() => { resolve(false) }, timeoutMs)
  })
}

export const isDeepLinkChecking = ref(false)

interface LaunchDeepLinkOptions {
  timeoutMs: number
  waitForDeepLinkResult: (timeoutMs: number) => Promise<boolean>
  onNotInstalled?: () => void
  onNotMobile?: () => void
  isMobileDevice: () => boolean
}

export const launchDeepLink = async (
  url: string,
  {
    timeoutMs,
    waitForDeepLinkResult,
    onNotInstalled,
    onNotMobile,
    isMobileDevice,
  }: LaunchDeepLinkOptions,
) => {
  const isMobile = isMobileDevice()

  if (!isMobile) {
    onNotMobile?.()
  }

  isDeepLinkChecking.value = true
  const overlayDelay = new Promise<void>((resolve) => {
    window.setTimeout(resolve, timeoutMs)
  })

  try {
    const launchMonitor = waitForDeepLinkResult(timeoutMs)
    window.location.href = url

    const didLaunch = await launchMonitor
    await overlayDelay
    if (!didLaunch) {
      onNotInstalled?.()
    }
  } finally {
    await overlayDelay
    isDeepLinkChecking.value = false
  }
}
