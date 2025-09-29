import type { PaymentActionContext, PaymentMethodAction } from '@/payments/workflows/types'

export const createDefaultAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: ({ method, currency }) => {
    context.openMethodUrl(method, currency)
  },
  handleCurrencySelection: ({ method, currency }) => {
    context.openMethodUrl(method, currency)
  },
})
