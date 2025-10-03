import { copyText } from '@/shared/utils/clipboard'
import type { TransferAccount } from '@/payments/services/paymentInfoService'

export const copyTransferInfo = async (
  account: TransferAccount,
  amount: number,
): Promise<boolean> => {
  const payload = `${account.bank} ${account.accountNumber} [${account.holder}] ₩${amount.toLocaleString('ko-KR')}`

  return copyText(payload)
}
