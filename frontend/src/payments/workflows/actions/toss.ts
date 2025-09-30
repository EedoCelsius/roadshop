import { resolveDeepLink } from '@/payments/services/deepLinkService'
import type { PaymentActionContext, PaymentMethodAction } from '@/payments/workflows/types'

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

  context.setTossDeepLinkUrl(null)

  if (!deepLink) {
    return
  }

  context.setTossDeepLinkUrl(deepLink)

  await context.copyTossAccountInfo()
  const shouldLaunch = await context.showTossInstructionDialog(5)

  if (!shouldLaunch) {
    context.completeTossInstructionDialog()
    return
  }

  const isMobile = context.isMobileDevice()

  if (!isMobile) {
    context.showDeepLinkPopup('not-mobile', 'toss')
  }

  try {
    await launchTossDeepLink(context, deepLink, { checkInstallation: isMobile })
  } finally {
    context.completeTossInstructionDialog()
  }

  if (!isMobile) {
    context.openUrlInNewTab(deepLink)
  }
}

export const createTossAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: () => runTossWorkflow(context),
  handleCurrencySelection: () => runTossWorkflow(context),
})
