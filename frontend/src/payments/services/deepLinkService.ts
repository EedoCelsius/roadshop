import { ref } from 'vue'

import { isMobileDevice } from '@/shared/utils/device'

let deepLinkLaunched = false
window.addEventListener('blur', () => { deepLinkLaunched = true })
document.addEventListener('visibilitychange', () => { if (document.hidden) { deepLinkLaunched = true } })

export const isDeepLinkChecking = ref(false)

interface LaunchDeepLinkOptions {
  timeoutMs: number
  onNotInstalled?: () => void
  onNotMobile?: () => void
}

export const launchDeepLink = async (
  url: string,
  {
    timeoutMs,
    onNotInstalled,
    onNotMobile,
  }: LaunchDeepLinkOptions,
) => {
  const loadDelay = new Promise<void>((resolve) => {
    window.setTimeout(resolve, timeoutMs)
  })
  
  try {
    deepLinkLaunched = false
    window.location.href = url

    if (!isMobileDevice()) {
      onNotMobile?.()
      return
    }
    
    isDeepLinkChecking.value = true
    await loadDelay
    
    if (!deepLinkLaunched) {
      onNotInstalled?.()
    }
  } finally {
    isDeepLinkChecking.value = false
  }
}
