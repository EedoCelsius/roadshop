import alipayIcon from '@icons/methods/alipay.svg'
import kakaotalkIcon from '@icons/methods/kakaotalk.svg'
import tossIcon from '@icons/methods/toss.png'
import mastercardIcon from '@icons/methods/mastercard.svg'
import naverIcon from '@icons/methods/naver.svg'
import paypalIcon from '@icons/methods/paypal.svg'
import amexIcon from '@icons/methods/amex.svg'
import unionpayIcon from '@icons/methods/unionpay.svg'
import visaIcon from '@icons/methods/visacard.svg'
import jcbIcon from '@icons/methods/jcb.svg'
import transferIcon from '@icons/methods/transfer.svg'

import type { PaymentMethod } from '@/payments/types'

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'transfer',
    currency: 'KRW',
    icons: [
      { src: transferIcon, alt: 'Bank transfer icon' },
    ],
  },
  {
    id: 'toss',
    currency: 'KRW',
    deepLinkProvider: 'toss',
    icons: [
      { src: tossIcon, alt: 'Toss logo' },
    ],
  },
  {
    id: 'kakao',
    currency: 'KRW',
    deepLinkProvider: 'kakao',
    icons: [
      { src: kakaotalkIcon, alt: 'KakaoTalk logo' },
    ],
  },
  {
    id: 'naver',
    currency: 'KRW',
    icons: [
      { src: naverIcon, alt: 'Naver logo' },
    ],
  },
  {
    id: 'alipay',
    currency: 'GLOBAL',
    icons: [
      { src: alipayIcon, alt: 'Alipay logo' },
    ],
  },
  {
    id: 'paypal',
    currency: 'GLOBAL',
    icons: [
      { src: paypalIcon, alt: 'PayPal logo' },
    ],
  },
  {
    id: 'card',
    currency: 'GLOBAL',
    icons: [
      { src: visaIcon, alt: 'Visa logo' },
      { src: mastercardIcon, alt: 'Mastercard logo' },
      { src: unionpayIcon, alt: 'UnionPay logo' },
      { src: amexIcon, alt: 'American Express logo' },
      { src: jcbIcon, alt: 'JCB logo' },
    ],
  },
]
