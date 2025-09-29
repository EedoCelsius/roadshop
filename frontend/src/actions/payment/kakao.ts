import { resolveDeepLink } from '@/utils/deepLink'

import type { PaymentActionContext, PaymentMethodAction } from './types'

const ensureKakaoDeepLink = async (context: PaymentActionContext): Promise<string | null> => {
  const loaded = await context.ensurePaymentInfoLoaded()

  if (!loaded) {
    return null
  }

  const info = context.getDeepLinkInfo('kakao')

  if (!info) {
    console.error('Missing Kakao payment info payload')
    return null
  }

  try {
    return resolveDeepLink('kakao', info)
  } catch (error) {
    console.error(error)
    return null
  }
}

const ensureKakaoLaunchableEnvironment = (
  context: PaymentActionContext,
): boolean => {
  if (context.isMobileDevice()) {
    return true
  }

  context.showDeepLinkPopup('not-mobile', 'kakao')
  return false
}

const launchKakaoDeepLink = async (
  context: PaymentActionContext,
  url: string,
) => {
  context.setDeepLinkChecking(true)

  try {
    const launchMonitor = context.waitForDeepLinkResult(1500)
    const didNavigate = context.navigateToDeepLink(url)

    if (!didNavigate) {
      await launchMonitor
      return
    }

    const didLaunch = await launchMonitor

    if (!didLaunch) {
      context.showDeepLinkPopup('not-installed', 'kakao')
    }
  } finally {
    context.setDeepLinkChecking(false)
  }
}

const runKakaoWorkflow = async (context: PaymentActionContext) => {
  const deepLink = await ensureKakaoDeepLink(context)

  if (!deepLink) {
    return
  }

  if (!ensureKakaoLaunchableEnvironment(context)) {
    return
  }

  await launchKakaoDeepLink(context, deepLink)
}

export const createKakaoAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: () => runKakaoWorkflow(context),
  handleCurrencySelection: () => runKakaoWorkflow(context),
})
