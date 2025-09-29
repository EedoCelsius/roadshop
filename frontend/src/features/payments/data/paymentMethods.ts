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

import type { PaymentMethod } from '@/features/payments/types'

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'transfer',
    name: 'Bank Transfer',
    description: 'Transfer the payment amount directly to the Stitchmon account.',
    currency: 'KRW',
    supportedCurrencies: ['KRW'],
    provider: 'Bank',
    status: 'available',
    icons: [
      { src: transferIcon, alt: 'Bank transfer icon' },
    ],
  },
  {
    id: 'toss',
    name: 'Toss Transfer',
    description: 'Send your payment instantly with Toss for immediate confirmation.',
    currency: 'KRW',
    supportedCurrencies: ['KRW'],
    provider: 'Viva Republica',
    status: 'available',
    deepLinkProvider: 'toss',
    icons: [
      { src: tossIcon, alt: 'Toss logo' },
    ],
  },
  {
    id: 'kakao',
    name: 'Kakao Transfer',
    description: 'Scan the QR code with KakaoTalk and finish checkout in seconds.',
    currency: 'KRW',
    supportedCurrencies: ['KRW'],
    provider: 'KakaoBank Corp.',
    status: 'available',
    deepLinkProvider: 'kakao',
    icons: [
      { src: kakaotalkIcon, alt: 'KakaoTalk logo' },
    ],
  },
  {
    id: 'naver',
    name: 'Naver Pay',
    description: 'We are preparing Naver Pay so you can pay with your points on the spot.',
    currency: 'KRW',
    supportedCurrencies: ['KRW'],
    provider: 'Naver Financial',
    status: 'coming-soon',
    icons: [
      { src: naverIcon, alt: 'Naver logo' },
    ],
  },
  {
    id: 'alipay',
    name: 'Alipay',
    description:
      'We plan to connect major global e-wallets through Alipay so travellers can pay with the wallet they already use.',
    currency: 'GLOBAL',
    supportedCurrencies: ['CNY', 'HKD', 'USD'],
    provider: 'Ant Group',
    status: 'coming-soon',
    urlsByCurrency: {
      CNY: 'https://global.alipay.com/cny',
      HKD: 'https://global.alipay.com/hkd',
      USD: 'https://global.alipay.com/usd',
    },
    icons: [
      { src: alipayIcon, alt: 'Alipay logo' },
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    description: 'Soon you will be able to complete your purchase with the PayPal account you already trust.',
    currency: 'GLOBAL',
    supportedCurrencies: ['USD', 'EUR', 'GBP'],
    provider: 'PayPal Holdings',
    status: 'coming-soon',
    urlsByCurrency: {
      USD: 'https://paypal.com/checkout?currency=USD',
      EUR: 'https://paypal.com/checkout?currency=EUR',
      GBP: 'https://paypal.com/checkout?currency=GBP',
    },
    icons: [
      { src: paypalIcon, alt: 'PayPal logo' },
    ],
  },
  {
    id: 'card',
    name: 'Credit Card',
    description: 'Worldwide card payments are on the roadmap so you can tap into a familiar checkout everywhere.',
    currency: 'GLOBAL',
    supportedCurrencies: ['USD', 'EUR', 'JPY', 'KRW'],
    provider: 'Global Networks',
    status: 'coming-soon',
    urlsByCurrency: {
      USD: 'https://payments.example.com/card/usd',
      EUR: 'https://payments.example.com/card/eur',
      JPY: 'https://payments.example.com/card/jpy',
      KRW: 'https://payments.example.com/card/krw',
    },
    icons: [
      { src: visaIcon, alt: 'Visa logo' },
      { src: mastercardIcon, alt: 'Mastercard logo' },
      { src: unionpayIcon, alt: 'UnionPay logo' },
      { src: amexIcon, alt: 'American Express logo' },
      { src: jcbIcon, alt: 'JCB logo' },
    ],
  },
]
