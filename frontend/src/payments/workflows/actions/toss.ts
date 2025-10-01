import { launchDeepLink, resolveDeepLink } from '@/payments/services/deepLinkService'
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

  try {
    await launchDeepLink(deepLink, {
      timeoutMs: 2000,
      waitForDeepLinkResult: context.waitForDeepLinkResult,
      onCheckingChange: context.setDeepLinkChecking,
      onNotInstalled: () => context.showDeepLinkPopup('not-installed', 'toss'),
      onNotMobile: () => context.showDeepLinkPopup('not-mobile', 'toss', { deepLinkUrl: deepLink }),
      isMobileDevice: context.isMobileDevice,
    })
  } finally {
    context.completeTossInstructionDialog()
  }
}

export const createTossAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: () => runTossWorkflow(context),
  handleCurrencySelection: () => runTossWorkflow(context),
})
