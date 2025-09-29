export const openUrlInNewTab = (url: string | null): void => {
  if (!url || typeof window === 'undefined') {
    return
  }

  window.open(url, '_blank', 'noopener,noreferrer')
}
