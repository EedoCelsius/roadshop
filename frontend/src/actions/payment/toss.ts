import { resolveDeepLink } from '@/utils/deepLink'

import type { PaymentMethodAction } from './types'
import type { PaymentActionContext } from './types'

const runTossWorkflow = async (context: PaymentActionContext) => {
  const loaded = await context.ensurePaymentInfoLoaded()

  if (!loaded) {
    return
  }

  const info = context.getDeepLinkInfo('toss')

  if (!info) {
    console.error('Missing Toss payment info payload')
    return
  }

  let url: string

  try {
    url = resolveDeepLink('toss', info)
  } catch (error) {
    console.error(error)
    return
  }

  if (!context.isMobileDevice()) {
    context.showDeepLinkPopup('not-mobile', 'toss')
    context.openUrlInNewTab(url)
    return
  }

  context.setDeepLinkChecking(true)

  try {
    const waitForLaunch = context.waitForDeepLinkResult(2000)
    const navigated = context.navigateToDeepLink(url)

    if (!navigated) {
      await waitForLaunch
      return
    }

    const didLaunch = await waitForLaunch

    if (!didLaunch) {
      context.showDeepLinkPopup('not-installed', 'toss')
    }
  } finally {
    context.setDeepLinkChecking(false)
  }
}

export const createTossAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: async () => {
    await runTossWorkflow(context)
  },
  handleCurrencySelection: async () => {
    await runTossWorkflow(context)
  },
})
