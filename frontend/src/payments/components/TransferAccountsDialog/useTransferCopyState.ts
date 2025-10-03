import { onBeforeUnmount, reactive, ref } from 'vue'

import type { TransferAccount } from '@/payments/services/paymentInfoService'
import { copyTransferInfo } from '@/payments/utils/copyTransferInfo'
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

  const markCopied = (account: TransferAccount, action: CopyAction) => {
    copyStates[account.number] = action
    scheduleReset(account.number)
  }

  const setHoveredControl = (account: TransferAccount, action: CopyAction, value: boolean) => {
    const key = controlKey(account.number, action)

    if (value) {
      hoveredControl.value = key
      return
    }

    if (hoveredControl.value === key) {
      hoveredControl.value = null
    }
  }

  const isCopied = (account: TransferAccount, action: CopyAction) => copyStates[account.number] === action

  const isTooltipVisible = (account: TransferAccount, action: CopyAction) => {
    const key = controlKey(account.number, action)
    return hoveredControl.value === key || isCopied(account, action)
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

  const handleCopyAll = async (account: TransferAccount, amount: number) => {
    const success = await copyTransferInfo(account, amount)

    if (success) {
      markCopied(account, 'all')
    }
  }

  const handleCopyNumber = async (account: TransferAccount) => {
    const success = await copyText(account.number)

    if (success) {
      markCopied(account, 'number')
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
