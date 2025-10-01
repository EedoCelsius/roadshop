import { resolveDeepLink } from '@/payments/services/deepLinkService'
import type { PaymentActionContext, PaymentMethodAction } from '@/payments/workflows/types'

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

const launchKakaoDeepLink = async (
  context: PaymentActionContext,
  url: string,
  { checkInstallation = true }: { checkInstallation?: boolean } = {},
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

    if (!didLaunch && checkInstallation) {
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

  const isMobile = context.isMobileDevice()

  if (!isMobile) {
    context.showDeepLinkPopup('not-mobile', 'kakao', { deepLinkUrl: deepLink })
  }

  await launchKakaoDeepLink(context, deepLink, { checkInstallation: isMobile })
}

export const createKakaoAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: () => runKakaoWorkflow(context),
  handleCurrencySelection: () => runKakaoWorkflow(context),
})
