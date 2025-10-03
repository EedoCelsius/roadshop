import { formatKrwAmount } from './formatKrwAmount'

export type TransferCopyAccount = {
  bank: string
  accountNumber: string
  holder: string
}

export type TransferCopyPayload = {
  payload: string
  amountText: string
}

type TransferCopyOptions = {
  locale?: string | null
  amountText?: string
}

export const createTransferCopyPayload = (
  account: TransferCopyAccount,
  amount: number,
  options: TransferCopyOptions = {},
): TransferCopyPayload => {
  const amountText =
    options.amountText ?? formatKrwAmount(amount, options.locale)

  return `${account.bank} ${account.accountNumber} [${account.holder}] ${amountText}`
}
