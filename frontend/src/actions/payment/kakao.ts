import { resolveDeepLink } from '@/utils/deepLink'

import type { PaymentMethodAction } from './types'
import type { PaymentActionContext } from './types'

const runKakaoWorkflow = async (context: PaymentActionContext) => {
  const loaded = await context.ensurePaymentInfoLoaded()

  if (!loaded) {
    return
  }

  const info = context.getDeepLinkInfo('kakao')

  if (!info) {
    console.error('Missing Kakao payment info payload')
    return
  }

  let url: string

  try {
    url = resolveDeepLink('kakao', info)
  } catch (error) {
    console.error(error)
    return
  }

  if (!context.isMobileDevice()) {
    context.showDeepLinkPopup('not-mobile', 'kakao')
    return
  }

  context.setDeepLinkChecking(true)

  try {
    const waitForLaunch = context.waitForDeepLinkResult(1500)
    const navigated = context.navigateToDeepLink(url)

    if (!navigated) {
      await waitForLaunch
      return
    }

    const didLaunch = await waitForLaunch

    if (!didLaunch) {
      context.showDeepLinkPopup('not-installed', 'kakao')
    }
  } finally {
    context.setDeepLinkChecking(false)
  }
}

export const createKakaoAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: async () => {
    await runKakaoWorkflow(context)
  },
  handleCurrencySelection: async () => {
    await runKakaoWorkflow(context)
  },
})
