import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const LOCALES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
] as const

export type Locale = (typeof LOCALES)[number]['code']

type Messages = {
  [key: string]: string | Messages
}

const LOCALE_STORAGE_KEY = 'roadshop:locale'

const messages: Record<Locale, Messages> = {
  en: {
    hero: {
      kicker: 'Stitchmon Roadshop',
      title: 'Pay for your Stitchmon order your way',
      badge: 'Official online checkout',
      description:
        "Use this Stitchmon Roadshop online payment page to complete your order. KakaoPay is ready for KRW purchases today, and we're bringing in more global-friendly options so every Stitchmon fan can check out smoothly.",
    },
    highlights: {
      instant: {
        title: 'Instant confirmation',
        description: 'Finish your Stitchmon Roadshop order in seconds with KakaoPay for KRW payments.',
      },
      guidance: {
        title: 'Clear guidance',
        description: 'We walk you through each available payment method step by step for Stitchmon orders.',
      },
      coverage: {
        title: 'Global-friendly roadmap',
        description: 'International wallets and cards are on the way so Stitchmon customers abroad can pay with ease.',
      },
    },
    sections: {
      krw: {
        title: 'KRW payments',
        description: 'Immediate options for Stitchmon Roadshop orders in Korean Won.',
      },
      global: {
        title: 'Global payments',
        description: 'Expanding choices for Stitchmon fans around the world.',
      },
    },
    status: {
      available: 'Available now',
      comingSoon: 'Coming soon',
    },
    card: {
      preparing: 'We are working hard to launch this option soon.',
    },
    footer: {
      message: '© {year} Stitchmon Roadshop. The official online payment center for your orders.',
    },
    language: {
      label: 'Language',
    },
    payment: {
      'kakaopay-qr': {
        description: 'Scan the QR code with KakaoTalk and finish checkout in seconds.',
        cta: 'Open KakaoPay',
      },
      'naverpay-qr': {
        description: 'We are preparing Naver Pay so you can pay with your points on the spot.',
      },
      alipay: {
        description:
          'We plan to connect major global e-wallets through Alipay so travellers can pay with the wallet they already use.',
      },
      paypal: {
        description: 'Soon you will be able to complete your purchase with the PayPal account you already trust.',
      },
      'credit-card': {
        description:
          'Visa, Mastercard, and UnionPay card payments are on the roadmap so you can tap into a familiar checkout everywhere.',
      },
    },
  },
  ko: {
    hero: {
      kicker: '스티치몬 로드샵',
      title: '스티치몬 주문을 원하는 방식으로 결제하세요',
      badge: '공식 온라인 결제',
      description:
        '이 페이지는 스티치몬 로드샵 공식 온라인 결제 창구예요. 지금은 카카오페이로 원화 결제를 지원하며, 해외 고객을 위한 다양한 결제 수단도 순차적으로 제공할 예정이에요.',
    },
    highlights: {
      instant: {
        title: '즉시 확인',
        description: '카카오페이로 스티치몬 로드샵 주문을 몇 초 만에 결제하고 확인할 수 있어요.',
      },
      guidance: {
        title: '친절한 안내',
        description: '각 결제 수단별 이용 방법을 차근차근 안내해 드려요.',
      },
      coverage: {
        title: '글로벌 준비',
        description: '해외 전자지갑과 카드 결제를 연동해 전 세계 스티치몬 팬이 쉽게 결제할 수 있도록 준비하고 있어요.',
      },
    },
    sections: {
      krw: {
        title: 'KRW 결제',
        description: '스티치몬 로드샵 원화 주문을 위한 즉시 결제 수단이에요.',
      },
      global: {
        title: 'GLOBAL 결제',
        description: '해외 스티치몬 고객을 위한 결제 옵션을 확장하고 있어요.',
      },
    },
    status: {
      available: '바로 이용 가능',
      comingSoon: '준비 중',
    },
    card: {
      preparing: '곧 만나보실 수 있도록 열심히 준비하고 있어요.',
    },
    footer: {
      message: '© {year} 스티치몬 로드샵. 공식 온라인 결제 센터입니다.',
    },
    language: {
      label: '언어',
    },
    payment: {
      'kakaopay-qr': {
        description: '카카오톡으로 QR을 스캔하고 빠르게 결제하세요.',
        cta: '카카오페이 열기',
      },
      'naverpay-qr': {
        description: '현장에서도 네이버페이 포인트로 간편하게 결제할 수 있도록 준비 중이에요.',
      },
      alipay: {
        description: '하나의 지갑으로 글로벌 주요 전자지갑을 연결해 결제를 지원할 계획이에요.',
      },
      paypal: {
        description: '글로벌 고객이 익숙한 PayPal 계정을 통해 손쉽게 결제할 수 있도록 준비하고 있어요.',
      },
      'credit-card': {
        description: 'Visa, Mastercard, UnionPay 등 전 세계 카드 결제를 곧 제공할게요.',
      },
    },
  },
  ja: {
    hero: {
      kicker: 'スティッチモン ロードショップ',
      title: 'スティッチモンのご注文をお好みの方法で決済',
      badge: '公式オンライン決済',
      description:
        'ここはスティッチモン ロードショップの公式オンライン決済ページです。現在はKRW決済にKakaoPayをご利用いただけ、海外のファン向けの手段も順次追加予定です。',
    },
    highlights: {
      instant: {
        title: '即時確認',
        description: 'KakaoPayでスティッチモンのご注文を数秒で決済し、その場で確認できます。',
      },
      guidance: {
        title: 'わかりやすい案内',
        description: '利用可能な各決済方法をステップごとにご案内します。',
      },
      coverage: {
        title: 'グローバル展開',
        description: '海外電子ウォレットやカード決済を順次追加し、世界のスティッチモンファンが安心して決済できるようにします。',
      },
    },
    sections: {
      krw: {
        title: 'KRW 決済',
        description: 'スティッチモン ロードショップのKRWご注文向け即時決済です。',
      },
      global: {
        title: 'グローバル決済',
        description: '海外のスティッチモンファン向けのオプションを拡充しています。',
      },
    },
    status: {
      available: '利用可能',
      comingSoon: '近日公開',
    },
    card: {
      preparing: 'まもなくご利用いただけるよう準備を進めています。',
    },
    footer: {
      message: '© {year} スティッチモン ロードショップ。公式オンライン決済センターです。',
    },
    language: {
      label: '言語',
    },
    payment: {
      'kakaopay-qr': {
        description: 'QRコードをKakaoTalkで読み取り、数秒で決済を完了できます。',
        cta: 'KakaoPayを開く',
      },
      'naverpay-qr': {
        description: 'Naver Payでもその場でポイント決済できるよう準備中です。',
      },
      alipay: {
        description: 'Alipayを通じて主要な海外電子ウォレットを連携し、いつものウォレットで支払えるようにします。',
      },
      paypal: {
        description: '普段使いのPayPalアカウントで決済できるよう近日対応予定です。',
      },
      'credit-card': {
        description: 'Visa・Mastercard・UnionPayなどの世界的なカード決済に近日対応します。',
      },
    },
  },
  zh: {
    hero: {
      kicker: 'Stitchmon 路店',
      title: '用你喜欢的方式支付 Stitchmon 订单',
      badge: '官方在线结账',
      description:
        '这里是 Stitchmon 路店的官方在线支付页面。现在可以使用 KakaoPay 完成韩元订单，我们也在为全球的 Stitchmon 粉丝上线更多友好的支付选项。',
    },
    highlights: {
      instant: {
        title: '即时确认',
        description: '通过 KakaoPay 几秒内完成 Stitchmon 路店订单并立即确认。',
      },
      guidance: {
        title: '清晰指引',
        description: '为 Stitchmon 订单的每种支付方式提供逐步说明。',
      },
      coverage: {
        title: '全球规划',
        description: '我们正引入国际电子钱包和银行卡，让全球 Stitchmon 粉丝都能轻松付款。',
      },
    },
    sections: {
      krw: {
        title: '韩元支付',
        description: '适用于 Stitchmon 路店韩元订单的即时支付选项。',
      },
      global: {
        title: '全球支付',
        description: '不断扩展，满足全球 Stitchmon 粉丝的支付需求。',
      },
    },
    status: {
      available: '立即可用',
      comingSoon: '即将推出',
    },
    card: {
      preparing: '我们正在全力准备，敬请期待。',
    },
    footer: {
      message: '© {year} Stitchmon 路店。官方在线支付中心。',
    },
    language: {
      label: '语言',
    },
    payment: {
      'kakaopay-qr': {
        description: '使用 KakaoTalk 扫描二维码，数秒内完成结账。',
        cta: '打开 KakaoPay',
      },
      'naverpay-qr': {
        description: '我们正在筹备 Naver Pay，让你当场即可使用积分付款。',
      },
      alipay: {
        description: '我们计划通过 Alipay 接入主要的全球电子钱包，让旅客可以用熟悉的钱包付款。',
      },
      paypal: {
        description: '你很快就能用熟悉的 PayPal 账户轻松完成购买。',
      },
      'credit-card': {
        description: '我们即将上线 Visa、Mastercard、UnionPay 等全球银行卡支付，让你随时享受熟悉的结账体验。',
      },
    },
  },
}

const isSupportedLocale = (value: string): value is Locale =>
  LOCALES.some((locale) => locale.code === value)

const readStoredLocale = (): Locale | undefined => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return undefined
  }

  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return stored && isSupportedLocale(stored) ? stored : undefined
  } catch (error) {
    return undefined
  }
}

const persistLocale = (value: Locale) => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, value)
  } catch (error) {
    // Ignore storage errors (e.g., quota exceeded, privacy mode)
  }
}

const matchLocale = (language: string): Locale | undefined => {
  const normalized = language.toLowerCase()
  return LOCALES.find((locale) => normalized.startsWith(locale.code))?.code
}

const resolveInitialLocale = (): Locale => {
  const stored = readStoredLocale()
  if (stored) {
    return stored
  }

  if (typeof navigator === 'undefined') {
    return 'en'
  }

  if (Array.isArray(navigator.languages)) {
    for (const language of navigator.languages) {
      const match = matchLocale(language)
      if (match) {
        return match
      }
    }
  }

  const fallback = navigator.language ? matchLocale(navigator.language) : undefined
  return fallback ?? 'en'
}

const getMessage = (locale: Locale, key: string): string | undefined => {
  const segments = key.split('.')
  let current: Messages | string | undefined = messages[locale]

  for (const segment of segments) {
    if (current && typeof current === 'object' && segment in current) {
      current = (current as Messages)[segment]
    } else {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref<Locale>(resolveInitialLocale())

  const availableLocales = computed(() =>
    LOCALES.map((entry) => ({
      ...entry,
      active: entry.code === locale.value,
    })),
  )

  const setLocale = (next: Locale) => {
    if (isSupportedLocale(next)) {
      locale.value = next
      persistLocale(next)
    }
  }

  const t = (key: string, fallback?: string): string => {
    const localized = getMessage(locale.value, key)
    if (localized) {
      return localized
    }

    const base = getMessage('en', key)
    if (base) {
      return base
    }

    if (fallback) {
      return fallback
    }

    return key
  }

  return {
    locale,
    availableLocales,
    setLocale,
    t,
  }
})
