import { onBeforeUnmount, reactive } from 'vue'

import { copyText } from '@/shared/utils/clipboard'

export type CopyAction = 'all' | 'number'

export const useTransferCopyState = () => {
  const copyStates = reactive<Record<string, CopyAction | null>>({})
  const copyTimers = new Map<string, number>()

  const scheduleReset = (accountNumber: string) => {
    if (typeof window === 'undefined') {
      return
    }

    const previousTimer = copyTimers.get(accountNumber)
    if (previousTimer) {
      window.clearTimeout(previousTimer)
    }

    const timeoutId = window.setTimeout(() => {
      copyStates[accountNumber] = null
      copyTimers.delete(accountNumber)
    }, 2000)

    copyTimers.set(accountNumber, timeoutId)
  }

  const markCopied = (accountNumber: string, action: CopyAction) => {
    copyStates[accountNumber] = action
    scheduleReset(accountNumber)
  }

  const isCopied = (accountNumber: string, action: CopyAction) => copyStates[accountNumber] === action

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
    }
  }

  const handleCopyNumber = async (accountNumber: string) => {
    const success = await copyText(accountNumber)

    if (success) {
      markCopied(accountNumber, 'number')
    }
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
