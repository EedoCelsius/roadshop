import type { PaymentActionContext, PaymentMethodAction } from '@/payments/workflows/types'

const ensureTransferInfoReady = async (
  context: PaymentActionContext,
): Promise<boolean> => {
  const loaded = await context.ensurePaymentInfoLoaded()

  if (!loaded) {
    return false
  }

  return true
}

const runTransferWorkflow = async (context: PaymentActionContext) => {
  const ready = await ensureTransferInfoReady(context)

  if (!ready) {
    return
  }

  context.openTransferDialog()
}

export const createTransferAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: () => runTransferWorkflow(context),
  handleCurrencySelection: () => runTransferWorkflow(context),
})
