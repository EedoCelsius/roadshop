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

export const waitForDeepLinkLaunch = (timeoutMs = 1500): Promise<boolean> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(true)
  }

  return new Promise<boolean>((resolve) => {
    let resolved = false

    const finalize = (didLaunch: boolean) => {
      if (resolved) {
        return
      }

      resolved = true
      window.clearTimeout(timerId)
      window.removeEventListener('blur', handleBlur)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      resolve(didLaunch)
    }

    const handleBlur = () => {
      finalize(true)
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        finalize(true)
      }
    }

    const timerId = window.setTimeout(() => {
      finalize(false)
    }, timeoutMs)

    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })
}

interface LaunchDeepLinkOptions {
  timeoutMs: number
  waitForDeepLinkResult: (timeoutMs: number) => Promise<boolean>
  onCheckingChange?: (isChecking: boolean) => void
  onNotInstalled?: () => void
  onNotMobile?: () => void
  isMobileDevice: () => boolean
}

const navigateToDeepLink = (url: string): boolean => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return false
  }

  window.location.href = url
  return true
}

export const launchDeepLink = async (
  url: string,
  {
    timeoutMs,
    waitForDeepLinkResult,
    onCheckingChange,
    onNotInstalled,
    onNotMobile,
    isMobileDevice,
  }: LaunchDeepLinkOptions,
) => {
  const isMobile = isMobileDevice()

  if (!isMobile) {
    onNotMobile?.()
    return
  }

  onCheckingChange?.(true)

  try {
    const launchMonitor = waitForDeepLinkResult(timeoutMs)
    const didNavigate = navigateToDeepLink(url)

    if (!didNavigate) {
      await launchMonitor
      return
    }

    const didLaunch = await launchMonitor

    if (!didLaunch) {
      onNotInstalled?.()
    }
  } finally {
    onCheckingChange?.(false)
  }
}
