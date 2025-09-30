import { onBeforeUnmount, reactive } from 'vue'

import { copyText } from '@/shared/utils/clipboard'

export type CopyAction = 'all' | 'number'

const controlKey = (accountNumber: string, action: CopyAction) => `${accountNumber}:${action}`

export const useTransferCopyState = () => {
  const copyStates = reactive<Record<string, CopyAction | null>>({})
  const copyTimers = new Map<string, number>()

  const scheduleReset = (key: string) => {
    if (typeof window === 'undefined') {
      return
    }

    const previousTimer = copyTimers.get(key)
    if (previousTimer) {
      window.clearTimeout(previousTimer)
    }

    const timeoutId = window.setTimeout(() => {
      copyStates[key] = null
      copyTimers.delete(key)
    }, 2000)

    copyTimers.set(key, timeoutId)
  }

  const markCopied = (accountNumber: string, action: CopyAction) => {
    const key = controlKey(accountNumber, action)
    copyStates[key] = action
    scheduleReset(key)
  }

  const isCopied = (accountNumber: string, action: CopyAction) =>
    copyStates[controlKey(accountNumber, action)] === action

  const reset = () => {
    Object.keys(copyStates).forEach((key) => {
      delete copyStates[key]
    })

    if (typeof window !== 'undefined') {
      copyTimers.forEach((timeoutId) => {
        window.clearTimeout(timeoutId)
      })
    }

    copyTimers.clear()
  }

  const handleCopyAll = async (accountNumber: string, payload: string) => {
    const success = await copyText(payload)

    if (success) {
      markCopied(accountNumber, 'all')
      return true
    }

    return false
  }

  const handleCopyNumber = async (accountNumber: string) => {
    const success = await copyText(accountNumber)

    if (success) {
      markCopied(accountNumber, 'number')
      return true
    }

    return false
  }

  onBeforeUnmount(() => {
    reset()
  })

  return {
    isCopied,
    handleCopyAll,
    handleCopyNumber,
    reset,
  }
}
