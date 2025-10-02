import type { PaymentIcon } from '@/payments/types'

import alipayIcon from './alipay.svg'
import amexIcon from './amex.svg'
import jcbIcon from './jcb.svg'
import kakaotalkIcon from './kakaotalk.svg'
import mastercardIcon from './mastercard.svg'
import naverIcon from './naver.svg'
import paypalIcon from './paypal.svg'
import tossIcon from './toss.png'
import transferIcon from './transfer.svg'
import unionpayIcon from './unionpay.svg'
import visaIcon from './visacard.svg'

export const methodIcons: Record<string, PaymentIcon[]> = {
  transfer: [
    { src: transferIcon, alt: 'Bank transfer icon' },
  ],
  toss: [
    { src: tossIcon, alt: 'Toss logo' },
  ],
  kakao: [
    { src: kakaotalkIcon, alt: 'KakaoTalk logo' },
  ],
  naver: [
    { src: naverIcon, alt: 'Naver logo' },
  ],
  alipay: [
    { src: alipayIcon, alt: 'Alipay logo' },
  ],
  paypal: [
    { src: paypalIcon, alt: 'PayPal logo' },
  ],
  card: [
    { src: visaIcon, alt: 'Visa logo' },
    { src: mastercardIcon, alt: 'Mastercard logo' },
    { src: unionpayIcon, alt: 'UnionPay logo' },
    { src: amexIcon, alt: 'American Express logo' },
    { src: jcbIcon, alt: 'JCB logo' },
  ],
}

export const getMethodIcons = (methodId: string): PaymentIcon[] | undefined => methodIcons[methodId]
