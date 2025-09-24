import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import alipayIcon from '@imgs/alipay.svg'
import kakaopayIcon from '@imgs/kakaopay.svg'
import mastercardIcon from '@imgs/mastercard.svg'
import naverpayIcon from '@imgs/naverpay.svg'
import paypalIcon from '@imgs/paypal.svg'
import unionpayIcon from '@imgs/unionpay.svg'
import visaIcon from '@imgs/visacard.svg'

type PaymentMethod = {
  id: string
  name: string
  description: string
  currency: 'KRW' | 'GLOBAL'
  provider: string
  status: 'available' | 'coming-soon'
  cta?: string
  url?: string
  icons?: Array<{
    src: string
    alt: string
  }>
}

export const usePaymentStore = defineStore('payment', () => {
  const methods = ref<PaymentMethod[]>([
    {
      id: 'kakaopay-qr',
      name: 'KakaoPay',
      description: 'Scan the QR code with KakaoTalk and finish checkout in seconds.',
      currency: 'KRW',
      provider: 'KakaoBank Corp.',
      status: 'available',
      cta: 'Open KakaoPay',
      url: 'https://qr.kakaopay.com/',
      icons: [
        { src: kakaopayIcon, alt: 'KakaoPay logo' },
      ],
    },
    {
      id: 'naverpay-qr',
      name: 'Naver Pay',
      description: 'We are preparing Naver Pay so you can pay with your points on the spot.',
      currency: 'KRW',
      provider: 'Naver Financial',
      status: 'coming-soon',
      icons: [
        { src: naverpayIcon, alt: 'Naver Pay logo' },
      ],
    },
    {
      id: 'alipay-plus',
      name: 'Alipay+',
      description:
        'We plan to connect major global e-wallets through Alipay+ so travellers can pay with the wallet they already use.',
      currency: 'GLOBAL',
      provider: 'Ant Group',
      status: 'coming-soon',
      icons: [
        { src: alipayIcon, alt: 'Alipay+ logo' },
        { src: unionpayIcon, alt: 'UnionPay logo' },
      ],
    },
    {
      id: 'paypal',
      name: 'PayPal',
      description: 'Soon you will be able to complete your purchase with the PayPal account you already trust.',
      currency: 'GLOBAL',
      provider: 'PayPal Holdings',
      status: 'coming-soon',
      icons: [
        { src: paypalIcon, alt: 'PayPal logo' },
      ],
    },
    {
      id: 'visa-mastercard',
      name: 'Visa / Mastercard',
      description: 'Worldwide card payments are on the roadmap so you can tap into a familiar checkout everywhere.',
      currency: 'GLOBAL',
      provider: 'Global Networks',
      status: 'coming-soon',
      icons: [
        { src: visaIcon, alt: 'Visa logo' },
        { src: mastercardIcon, alt: 'Mastercard logo' },
      ],
    },
  ])

  const krwMethods = computed(() => methods.value.filter((method) => method.currency === 'KRW'))
  const globalMethods = computed(() => methods.value.filter((method) => method.currency === 'GLOBAL'))

  return {
    methods,
    krwMethods,
    globalMethods,
  }
})
