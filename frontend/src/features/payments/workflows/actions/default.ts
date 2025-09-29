import type { PaymentActionContext, PaymentMethodAction } from '@/features/payments/workflows/types'

export const createDefaultAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: ({ method, currency }) => {
    context.openMethodUrl(method, currency)
  },
  handleCurrencySelection: ({ method, currency }) => {
    context.openMethodUrl(method, currency)
  },
})
