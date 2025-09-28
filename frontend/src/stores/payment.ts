import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import bankList from '../config/bankList.json'
import info from '../config/info.json'

import alipayIcon from '@imgs/alipay.svg'
import kakaotalkIcon from '@imgs/kakaotalk.svg'
import tossIcon from '@imgs/toss.png'
import mastercardIcon from '@imgs/mastercard.svg'
import naverIcon from '@imgs/naver.svg'
import paypalIcon from '@imgs/paypal.svg'
import amexIcon from '@imgs/amex.svg'
import unionpayIcon from '@imgs/unionpay.svg'
import visaIcon from '@imgs/visacard.svg'
import jcbIcon from '@imgs/jcb.svg'

export type PaymentMethod = {
  id: string
  name: string
  description: string
  currency: 'KRW' | 'GLOBAL'
  supportedCurrencies: string[]
  provider: string
  status: 'available' | 'coming-soon'
  cta?: string
  url?: string
  urlsByCurrency?: Record<string, string>
  icons?: Array<{
    src: string
    alt: string
  }>
}

export type PaymentCurrency = PaymentMethod['currency']

type BankListEntry = { code: string; name: string }

const banks = (bankList as { banks?: BankListEntry[] }).banks ?? []

const resolveTossDeepLink = () => {
  const params = new URLSearchParams({
    amount: info.toss.amount.krw,
    bank: info.toss.bankName,
    accountNo: info.toss.accountNo,
  })

  return `supertoss://send?${params.toString()}`
}

export const usePaymentStore = defineStore('payment', () => {
  const methods = ref<PaymentMethod[]>([
    {
      id: 'toss',
      name: 'Toss Transfer',
      description: 'Send your payment instantly with Toss for immediate confirmation.',
      currency: 'KRW',
      supportedCurrencies: ['KRW'],
      provider: 'Viva Republica',
      status: 'available',
      cta: 'Open Toss',
      url: resolveTossDeepLink(),
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
      cta: 'Open Kakao Transfer',
      url: 'https://qr.kakaopay.com/',
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
  ])

  const methodsByCurrency = computed(() => {
    const grouped: Record<PaymentCurrency, PaymentMethod[]> = {
      KRW: [],
      GLOBAL: [],
    }

    methods.value.forEach((method) => {
      grouped[method.currency].push(method)
    })

    return grouped
  })

  const selectedMethodId = ref<string | null>(null)
  const selectedCurrency = ref<string | null>(null)
  const isCurrencySelectorOpen = ref(false)

  const selectedMethod = computed(() =>
    selectedMethodId.value ? methods.value.find((method) => method.id === selectedMethodId.value) ?? null : null
  )

  const selectMethod = (methodId: string) => {
    const method = methods.value.find((item) => item.id === methodId)

    if (!method) {
      return
    }

    selectedMethodId.value = methodId

    if (method.supportedCurrencies.length <= 1) {
      selectedCurrency.value = method.supportedCurrencies[0] ?? null
      isCurrencySelectorOpen.value = false
      return
    }

    selectedCurrency.value = null
    isCurrencySelectorOpen.value = true
  }

  const chooseCurrency = (currency: string) => {
    const method = selectedMethod.value

    if (!method || !method.supportedCurrencies.includes(currency)) {
      return
    }

    selectedCurrency.value = currency
    isCurrencySelectorOpen.value = false
  }

  const closeCurrencySelector = () => {
    isCurrencySelectorOpen.value = false
  }

  const getUrlForMethod = (methodId: string, currency?: string | null) => {
    const method = methods.value.find((item) => item.id === methodId)

    if (!method) {
      return null
    }

    if (currency && method.urlsByCurrency?.[currency]) {
      return method.urlsByCurrency[currency]
    }

    return method.url ?? null
  }

  return {
    methods,
    methodsByCurrency,
    selectedMethodId,
    selectedMethod,
    selectedCurrency,
    isCurrencySelectorOpen,
    selectMethod,
    chooseCurrency,
    closeCurrencySelector,
    getUrlForMethod,
  }
})
