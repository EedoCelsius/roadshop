import { buildPaymentsApiUrl } from '@/payments/services/paymentInfoService'

export type StripePaymentIntentPayload = {
  clientSecret: string | null
  publishableKey: string | null
  isMock?: boolean
  message?: string
}

const DEFAULT_API_ENDPOINT = '/api/payment-intents'
const DEFAULT_TEST_RESPONSE_PATH = 'test-payment-intent.json'

const resolveApiEndpoint = (): string => {
  const envEndpoint = import.meta.env?.VITE_STRIPE_PAYMENT_INTENT_URL as string | undefined
  if (envEndpoint && envEndpoint.length > 0) {
    return envEndpoint
  }

  return DEFAULT_API_ENDPOINT
}

const resolveFallbackUrl = (): string => {
  const envFallback = import.meta.env?.VITE_STRIPE_PAYMENT_INTENT_FALLBACK_URL as string | undefined
  if (envFallback && envFallback.length > 0) {
    return envFallback
  }

  return buildPaymentsApiUrl(DEFAULT_TEST_RESPONSE_PATH)
}

const parseJson = async (response: Response): Promise<StripePaymentIntentPayload> => {
  const data = (await response.json()) as StripePaymentIntentPayload
  return {
    clientSecret: data.clientSecret ?? null,
    publishableKey: data.publishableKey ?? null,
    isMock: data.isMock ?? false,
    message: data.message,
  }
}

export const createStripePaymentIntent = async (
  currency: string,
  amount?: number,
): Promise<StripePaymentIntentPayload> => {
  const endpoint = resolveApiEndpoint()

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currency, amount }),
    })

    if (!response.ok) {
      throw new Error(`Stripe backend responded with ${response.status}`)
    }

    return await parseJson(response)
  } catch (error) {
    console.warn('Falling back to mock Stripe response:', error)
    const fallbackResponse = await fetch(resolveFallbackUrl())

    if (!fallbackResponse.ok) {
      throw new Error(`Failed to load Stripe fallback response: ${fallbackResponse.status}`)
    }

    return await parseJson(fallbackResponse)
  }
}

