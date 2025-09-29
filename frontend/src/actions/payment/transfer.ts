import type { PaymentMethodAction } from './types'
import type { PaymentActionContext } from './types'

export const createTransferAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: async () => {
    const loaded = await context.ensurePaymentInfoLoaded()

    if (!loaded) {
      return
    }

    context.openTransferPopup()
  },
  handleCurrencySelection: async () => {
    const loaded = await context.ensurePaymentInfoLoaded()

    if (!loaded) {
      return
    }

    context.openTransferPopup()
  },
})
