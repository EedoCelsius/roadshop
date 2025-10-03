import { copyText } from '@/shared/utils/clipboard'
import type { TransferAccount } from '@/payments/services/paymentInfoService'

export const copyTransferInfo = async (
  account: TransferAccount,
  amount: number,
): Promise<boolean> => {
  const payload = `${account.bank} ${account.number} ${account.holder} [${amount.toLocaleString('ko-KR')}원]`

  return copyText(payload)
}
