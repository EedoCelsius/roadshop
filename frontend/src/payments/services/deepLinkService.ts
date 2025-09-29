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
    let timerId: number | undefined

    const finalize = (didLaunch: boolean) => {
      if (resolved) {
        return
      }

      resolved = true
      if (timerId) {
        window.clearTimeout(timerId)
      }
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

    timerId = window.setTimeout(() => {
      finalize(false)
    }, timeoutMs)

    window.addEventListener('blur', handleBlur)
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })
}
