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
  account: TransferAccount
}

export type KakaoPaymentInfo = {
  amount: AmountKRW
  personalCode: string
}

export type MethodUrlInfo = {
  url: Record<string, string>
}

export type AvailablePaymentMethod = {
  id: string
  supportedCurrencies: string[]
  deepLinkProvider?: DeepLinkProvider
}

export type PaymentMethodDetail =
  | { type: 'transfer'; data: TransferPaymentInfo }
  | { type: 'toss'; data: TossPaymentInfo }
  | { type: 'kakao'; data: KakaoPaymentInfo }
  | { type: 'url'; data: MethodUrlInfo }

const DEFAULT_API_BASE_URL =
  'https://raw.githubusercontent.com/EedoCelsius/roadshop/refs/heads/main/backend/response'

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '')
const normalizePath = (value: string): string => value.replace(/^\/+/, '')

const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env?.VITE_PAYMENTS_API_BASE_URL as string | undefined
  return normalizeBaseUrl(envUrl && envUrl.length ? envUrl : DEFAULT_API_BASE_URL)
}

const buildApiUrl = (path: string): string => `${getApiBaseUrl()}/${normalizePath(path)}`

const requestJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(buildApiUrl(path))

  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status}`)
  }

  return (await response.json()) as T
}

type AvailableMethodResponse = {
  methods: AvailablePaymentMethod[]
}

type PaymentMethodDetailResponse =
  | { id: string; type: 'transfer'; payload: TransferPaymentInfo }
  | { id: string; type: 'toss'; payload: TossPaymentInfo }
  | { id: string; type: 'kakao'; payload: KakaoPaymentInfo }
  | { id: string; type: 'url'; payload: MethodUrlInfo }

export const fetchAvailablePaymentMethods = async (): Promise<AvailablePaymentMethod[]> => {
  const data = await requestJson<AvailableMethodResponse>('payment-methods.json')
  return data.methods
}

const normalizeDetail = (detail: PaymentMethodDetailResponse): PaymentMethodDetail => {
  switch (detail.type) {
    case 'transfer':
      return { type: 'transfer', data: detail.payload }
    case 'toss':
      return { type: 'toss', data: detail.payload }
    case 'kakao':
      return { type: 'kakao', data: detail.payload }
    case 'url':
      return { type: 'url', data: detail.payload }
    default:
      throw new Error(`Unsupported payment detail type: ${(detail as { type?: string }).type ?? 'unknown'}`)
  }
}

export const fetchPaymentMethodDetail = async (methodId: string): Promise<PaymentMethodDetail> => {
  const detail = await requestJson<PaymentMethodDetailResponse>(`method-${methodId}.json`)
  return normalizeDetail(detail)
}
