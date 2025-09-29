import { resolveDeepLink } from '@/features/payments/services/deepLinkService'
import type { PaymentActionContext, PaymentMethodAction } from '@/features/payments/workflows/types'

const ensureTossDeepLink = async (context: PaymentActionContext): Promise<string | null> => {
  const loaded = await context.ensurePaymentInfoLoaded()

  if (!loaded) {
    return null
  }

  const info = context.getDeepLinkInfo('toss')

  if (!info) {
    console.error('Missing Toss payment info payload')
    return null
  }

  try {
    return resolveDeepLink('toss', info)
  } catch (error) {
    console.error(error)
    return null
  }
}

const launchTossDeepLink = async (
  context: PaymentActionContext,
  url: string,
  { checkInstallation = true }: { checkInstallation?: boolean } = {},
) => {
  context.setDeepLinkChecking(true)

  try {
    const launchMonitor = context.waitForDeepLinkResult(2000)
    const didNavigate = context.navigateToDeepLink(url)

    if (!didNavigate) {
      await launchMonitor
      return
    }

    const didLaunch = await launchMonitor

    if (!didLaunch && checkInstallation) {
      context.showDeepLinkPopup('not-installed', 'toss')
    }
  } finally {
    context.setDeepLinkChecking(false)
  }
}

const runTossWorkflow = async (context: PaymentActionContext) => {
  const deepLink = await ensureTossDeepLink(context)

  if (!deepLink) {
    return
  }

  const isMobile = context.isMobileDevice()

  if (!isMobile) {
    context.showDeepLinkPopup('not-mobile', 'toss')
  }

  await launchTossDeepLink(context, deepLink, { checkInstallation: isMobile })

  if (!isMobile) {
    context.openUrlInNewTab(deepLink)
  }
}

export const createTossAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: () => runTossWorkflow(context),
  handleCurrencySelection: () => runTossWorkflow(context),
})
