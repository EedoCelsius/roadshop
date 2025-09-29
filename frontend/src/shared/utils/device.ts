export const isMobileDevice = (): boolean => {
  if (typeof navigator === 'undefined') {
    return false
  }

  const userAgent = navigator.userAgent || navigator.vendor || (window as typeof window & { opera?: string }).opera || ''

  return /android|iphone|ipad|ipod|windows phone/i.test(userAgent)
}
