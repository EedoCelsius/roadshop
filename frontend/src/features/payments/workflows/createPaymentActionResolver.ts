import type { PaymentMethod } from '@/features/payments/types'

import { createDefaultAction } from '@/features/payments/workflows/actions/default'
import { createKakaoAction } from '@/features/payments/workflows/actions/kakao'
import { createTossAction } from '@/features/payments/workflows/actions/toss'
import { createTransferAction } from '@/features/payments/workflows/actions/transfer'
import type { PaymentActionContext, PaymentMethodAction } from '@/features/payments/workflows/types'

const createActionForMethod = (
  context: PaymentActionContext,
  methodId: PaymentMethod['id'],
): PaymentMethodAction => {
  switch (methodId) {
    case 'transfer':
      return createTransferAction(context)
    case 'toss':
      return createTossAction(context)
    case 'kakao':
      return createKakaoAction(context)
    default:
      return createDefaultAction(context)
  }
}

export const createPaymentActionResolver = (
  context: PaymentActionContext,
): ((method: PaymentMethod) => PaymentMethodAction) => {
  const actionCache = new Map<PaymentMethod['id'], PaymentMethodAction>()

  return (method: PaymentMethod) => {
    const cached = actionCache.get(method.id)

    if (cached) {
      return cached
    }

    const action = createActionForMethod(context, method.id)
    actionCache.set(method.id, action)
    return action
  }
}

export type {
  PaymentActionContext,
  PaymentMethodAction,
  PaymentSelectionPayload,
  PaymentCurrencySelectionPayload,
  DeepLinkPopupType,
} from '@/features/payments/workflows/types'
