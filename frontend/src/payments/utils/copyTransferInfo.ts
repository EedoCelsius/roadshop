import { copyText } from '@/shared/utils/clipboard'

export type TransferCopyAccount = {
  bank: string
  accountNumber: string
  holder: string
}

const formatAmountForCopy = (amount: number): string => `₩${amount.toLocaleString('ko-KR')}`

export const copyTransferInfo = async (
  account: TransferCopyAccount,
  amount: number,
): Promise<boolean> => {
  const amountText = formatAmountForCopy(amount)
  const payload = `${account.bank} ${account.accountNumber} [${account.holder}] ${amountText}`

  return copyText(payload)
}
