import { launchDeepLink, resolveDeepLink } from '@/payments/services/deepLinkService'
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

const runKakaoWorkflow = async (context: PaymentActionContext) => {
  const deepLink = await ensureKakaoDeepLink(context)

  if (!deepLink) {
    return
  }

  await launchDeepLink(deepLink, {
    timeoutMs: 1500,
    onNotInstalled: () => context.showDeepLinkPopup('not-installed', 'kakao'),
    onNotMobile: () => context.showDeepLinkPopup('not-mobile', 'kakao', { deepLinkUrl: deepLink }),
  })
}

export const createKakaoAction = (context: PaymentActionContext): PaymentMethodAction => ({
  handleSelection: () => runKakaoWorkflow(context),
  handleCurrencySelection: () => runKakaoWorkflow(context),
})
