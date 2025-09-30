import type { DeepLinkProvider } from '@/payments/types'

export type TransferAccount = {
  bank: string
  number: string
  holder: string
}

export type AmountKRW = {
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

export const loadPaymentInfo = async (): Promise<PaymentInfo> => {
  const module = await import('@/payments/data/info.json')
  return module.default as PaymentInfo
}

export const resolveDeepLinkPayload = (
  info: PaymentInfo | null,
  provider: DeepLinkProvider,
): TossPaymentInfo | KakaoPaymentInfo | null => {
  if (!info) {
    return null
  }

  if (provider === 'toss') {
    return info.toss ?? null
  }

  if (provider === 'kakao') {
    return info.kakao ?? null
  }

  return null
}
