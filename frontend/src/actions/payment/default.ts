import type { PaymentMethodAction } from './types'
import type { PaymentActionContext } from './types'

export const createDefaultAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: ({ method, currency }) => {
    context.openMethodUrl(method, currency)
  },
  handleCurrencySelection: ({ method, currency }) => {
    context.openMethodUrl(method, currency)
  },
})
