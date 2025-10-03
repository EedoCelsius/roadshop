import { onBeforeUnmount, reactive, ref } from 'vue'

import { copyText } from '@/shared/utils/clipboard'

export type CopyAction = 'all' | 'number'

const controlKey = (accountNumber: string, action: CopyAction) => `${accountNumber}:${action}`

export const useTransferCopyState = () => {
  const copyStates = reactive<Record<string, CopyAction | null>>({})
  const copyTimers = new Map<string, number>()
  const hoveredControl = ref<string | null>(null)

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

  const markCopied = (key: string, action: CopyAction) => {
    copyStates[key] = action
    scheduleReset(key)
  }

  const setHoveredControl = (accountNumber: string, action: CopyAction, value: boolean) => {
    const key = controlKey(accountNumber, action)

    if (value) {
      hoveredControl.value = key
      return
    }

    if (hoveredControl.value === key) {
      hoveredControl.value = null
    }
  }

  const isCopied = (accountNumber: string, action: CopyAction) => copyStates[accountNumber] === action

  const isTooltipVisible = (accountNumber: string, action: CopyAction) => {
    const key = controlKey(accountNumber, action)
    return hoveredControl.value === key || isCopied(accountNumber, action)
  }

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
    hoveredControl.value = null
  }

  const handleCopyAll = async (
    accountNumber: string,
    copyAction: () => Promise<boolean>,
  ) => {
    const success = await copyAction()

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
    isTooltipVisible,
    setHoveredControl,
    handleCopyAll,
    handleCopyNumber,
    reset,
  }
}
