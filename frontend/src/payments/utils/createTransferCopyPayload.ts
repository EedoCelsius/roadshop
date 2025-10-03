import { formatKrwAmount } from './formatKrwAmount'

export type TransferCopyAccount = {
  bank: string
  accountNumber: string
  holder: string
}

export const createTransferCopyPayload = (
  account: TransferCopyAccount,
  amount: number,
  locale: string | null,
): string => {
  const amountText = formatKrwAmount(amount, locale)
  return `${account.bank} ${account.accountNumber} [${account.holder}] ${amountText}`
}
