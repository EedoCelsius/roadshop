import type { PaymentMethod } from '@/stores/payment'

import { createDefaultAction } from './default'
import { createKakaoAction } from './kakao'
import { createTossAction } from './toss'
import { createTransferAction } from './transfer'
import type { PaymentActionContext, PaymentMethodAction } from './types'

export const createPaymentActionResolver = (
  context: PaymentActionContext,
): ((method: PaymentMethod) => PaymentMethodAction) => {
  const transferAction = createTransferAction(context)
  const tossAction = createTossAction(context)
  const kakaoAction = createKakaoAction(context)
  const defaultAction = createDefaultAction(context)

  return (method: PaymentMethod) => {
    switch (method.id) {
      case 'transfer':
        return transferAction
      case 'toss':
        return tossAction
      case 'kakao':
        return kakaoAction
      default:
        return defaultAction
    }
  }
}

export type {
  PaymentActionContext,
  PaymentMethodAction,
  PaymentSelectionPayload,
  PaymentCurrencySelectionPayload,
  DeepLinkPopupType,
} from './types'
