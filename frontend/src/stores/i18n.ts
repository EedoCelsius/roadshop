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

const messages: Record<Locale, Messages> = {
  en: {
    hero: {
      kicker: 'Road Shop Pay',
      title: 'Pay your way with one QR code',
      badge: 'Live payment support',
      description:
        "Scan the QR code at any street vendor and Road Shop Pay guides you to the fastest checkout. KakaoPay already covers KRW purchases, and we're rolling out more options for visitors from around the world.",
    },
    highlights: {
      instant: {
        title: 'Instant checkout',
        description: 'Scan the QR and jump straight into KakaoPay for a fast KRW payment.',
      },
      guidance: {
        title: 'Tailored guidance',
        description: 'We recommend payment methods that fit your language and currency.',
      },
      coverage: {
        title: 'Global coverage',
        description: 'International wallets and cards are coming so every traveler can pay with ease.',
      },
    },
    sections: {
      krw: {
        title: 'KRW payments',
        description: 'Immediate options for domestic shoppers.',
      },
      global: {
        title: 'Global payments',
        description: 'Expanding choices for international visitors.',
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
      message: '© {year} Road Shop Pay. Empowering street vendors to welcome every traveler.',
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
      'alipay-plus': {
        description:
          'We plan to connect major global e-wallets through Alipay+ so travellers can pay with the wallet they already use.',
      },
      paypal: {
        description: 'Soon you will be able to complete your purchase with the PayPal account you already trust.',
      },
      'visa-mastercard-unionpay': {
        description:
          'Visa, Mastercard, and UnionPay card payments are on the roadmap so you can tap into a familiar checkout everywhere.',
      },
    },
  },
  ko: {
    hero: {
      kicker: 'Road Shop Pay',
      title: 'QR 하나로 원하는 방식으로 결제하세요',
      badge: '현장 결제 지원 중',
      description:
        '길거리 상점에서 QR 코드를 스캔하면 Road Shop Pay가 가장 빠르고 편한 결제 수단을 안내해 드려요. 국내에서는 카카오페이를 바로 이용할 수 있고, 해외 이용자를 위한 다양한 결제 수단도 순차적으로 제공할 예정이에요.',
    },
    highlights: {
      instant: {
        title: '바로 결제',
        description: 'QR 스캔 후 카카오페이 앱으로 이동해 즉시 결제할 수 있어요.',
      },
      guidance: {
        title: '실시간 안내',
        description: '고객 언어와 통화에 맞는 결제 수단을 자동으로 추천해요.',
      },
      coverage: {
        title: '글로벌 커버리지',
        description: '해외 전자지갑과 카드 결제를 연동해 누구나 쉽게 결제할 수 있도록 준비하고 있어요.',
      },
    },
    sections: {
      krw: {
        title: 'KRW 결제',
        description: '국내 고객을 위한 즉시 결제 수단이에요.',
      },
      global: {
        title: 'GLOBAL 결제',
        description: '해외 고객을 위한 결제 옵션을 확장하고 있어요.',
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
      message: '© {year} Road Shop Pay. 길거리 상점을 위한 최고의 결제 파트너가 될게요.',
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
      'alipay-plus': {
        description: '하나의 지갑으로 글로벌 주요 전자지갑을 연결해 결제를 지원할 계획이에요.',
      },
      paypal: {
        description: '글로벌 고객이 익숙한 PayPal 계정을 통해 손쉽게 결제할 수 있도록 준비하고 있어요.',
      },
      'visa-mastercard-unionpay': {
        description: 'Visa, Mastercard, UnionPay 등 전 세계 카드 결제를 곧 제공할게요.',
      },
    },
  },
  ja: {
    hero: {
      kicker: 'Road Shop Pay',
      title: 'QRコードひとつでお好みの支払いを',
      badge: '店頭サポート中',
      description:
        '屋台やストリートショップでQRコードを読み取ると、Road Shop Payが最適な決済方法を案内します。KRW決済はすでにKakaoPayに対応しており、海外からのお客様向けの手段も順次追加予定です。',
    },
    highlights: {
      instant: {
        title: '即時チェックアウト',
        description: 'QRを読み取ればKakaoPayで素早くウォン決済できます。',
      },
      guidance: {
        title: '最適な案内',
        description: 'お客様の言語と通貨に合わせた決済方法をおすすめします。',
      },
      coverage: {
        title: 'グローバル対応',
        description: '海外電子ウォレットやカード決済を順次追加し、誰でも簡単に支払えるようにします。',
      },
    },
    sections: {
      krw: {
        title: 'KRW 決済',
        description: '国内のお客様向けの即時決済です。',
      },
      global: {
        title: 'グローバル決済',
        description: '海外からのお客様向けのオプションを拡充しています。',
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
      message: '© {year} Road Shop Pay. すべての旅行者を迎えられるよう街の店舗を支援します。',
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
      'alipay-plus': {
        description: 'Alipay+を通じて主要な海外電子ウォレットを連携し、いつものウォレットで支払えるようにします。',
      },
      paypal: {
        description: '普段使いのPayPalアカウントで決済できるよう近日対応予定です。',
      },
      'visa-mastercard-unionpay': {
        description: 'Visa・Mastercard・UnionPayなどの世界的なカード決済に近日対応します。',
      },
    },
  },
  zh: {
    hero: {
      kicker: 'Road Shop Pay',
      title: '一个二维码随心支付',
      badge: '现场支付支持中',
      description:
        '在街头商店扫描二维码，Road Shop Pay 会为你指引最快速、最合适的结账方式。国内的 KakaoPay 已能立即使用，我们也在为来自世界各地的访客上线更多支付选项。',
    },
    highlights: {
      instant: {
        title: '即时结账',
        description: '扫描二维码后即可跳转到 KakaoPay，迅速完成韩元支付。',
      },
      guidance: {
        title: '贴心指引',
        description: '我们会根据你的语言与货币推荐最合适的支付方式。',
      },
      coverage: {
        title: '全球覆盖',
        description: '国际电子钱包和银行卡即将上线，让每位旅客都能轻松付款。',
      },
    },
    sections: {
      krw: {
        title: '韩元支付',
        description: '为本地顾客提供的即时支付选项。',
      },
      global: {
        title: '全球支付',
        description: '为海外访客持续扩展的支付选择。',
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
      message: '© {year} Road Shop Pay. 让街头商贩都能欢迎每一位旅客。',
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
      'alipay-plus': {
        description: '我们计划通过 Alipay+ 接入主要的全球电子钱包，让旅客可以用熟悉的钱包付款。',
      },
      paypal: {
        description: '你很快就能用熟悉的 PayPal 账户轻松完成购买。',
      },
      'visa-mastercard-unionpay': {
        description: '我们即将上线 Visa、Mastercard、UnionPay 等全球银行卡支付，让你随时享受熟悉的结账体验。',
      },
    },
  },
}

const matchLocale = (language: string): Locale | undefined => {
  const normalized = language.toLowerCase()
  return LOCALES.find((locale) => normalized.startsWith(locale.code))?.code
}

const resolveInitialLocale = (): Locale => {
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
    if (LOCALES.some((entry) => entry.code === next)) {
      locale.value = next
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
