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
        "Use this Stitchmon Roadshop online payment page to complete your order. Kakao Transfer is ready for KRW purchases today, and we're bringing in more global-friendly options so every Stitchmon fan can check out smoothly.",
    },
    highlights: {
      instant: {
        title: 'Instant confirmation',
        description: 'Finish your Stitchmon Roadshop order in seconds with Kakao Transfer for KRW payments.',
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
      selectedCurrency: 'Selected currency: {currency}',
      selectCurrencyPrompt: 'Choose a currency to continue.',
    },
    footer: {
      message: '© {year} Stitchmon Roadshop. The official online payment center for your orders.',
    },
    language: {
      label: 'Language',
    },
    loading: {
      deepLink: 'Opening the app to continue your payment…',
    },
    popups: {
      deepLink: {
        titles: {
          notMobile: 'Open on your mobile device',
          notInstalled: 'Having trouble opening the app?',
        },
        confirms: {
          notMobile: 'Got it',
          notInstalled: 'OK',
        },
        providers: {
          kakao: {
            notMobile:
              'The Kakao Transfer link opens only in the KakaoTalk app on mobile. Please continue on your phone.',
            notInstalled:
              "If KakaoTalk didn't open, please make sure it's installed and try again.",
          },
          toss: {
            notMobile:
              'The Toss Transfer link opens only in the Toss app on mobile. Please continue on your phone.',
            notInstalled:
              "If Toss didn't open, please make sure it's installed and try again.",
          },
        },
      },
    },
    currencySelector: {
      title: 'Choose a currency',
      description: 'Select the currency you want to use with {method}.',
      cancel: 'Cancel',
    },
    payment: {
      'kakao': {
        name: 'Kakao Transfer',
        description: 'Scan the QR code with KakaoTalk and finish checkout in seconds.',
        cta: 'Open Kakao Transfer',
      },
      'toss': {
        name: 'Toss Transfer',
        description: 'Send your payment instantly with Toss and see the confirmation immediately.',
        cta: 'Open Toss',
      },
      'naver': {
        name: 'Naver Pay',
        description: 'We are preparing Naver Pay so you can pay with your points on the spot.',
      },
      alipay: {
        name: 'Alipay',
        description:
          'We plan to connect major global e-wallets through Alipay so travellers can pay with the wallet they already use.',
      },
      paypal: {
        name: 'PayPal',
        description: 'Soon you will be able to complete your purchase with the PayPal account you already trust.',
      },
      'card': {
        name: 'Credit Card',
        description:
          'Visa, Mastercard, UnionPay, Amex, and JCB card payments are on the roadmap so you can tap into a familiar checkout everywhere.',
      },
    },
  },
  ko: {
    hero: {
      kicker: '스티치몬 로드샵',
      title: '스티치몬 주문을 원하는 방식으로 결제하세요',
      badge: '공식 온라인 결제',
      description:
        '이 페이지는 스티치몬 로드샵 공식 온라인 결제 창구예요. 지금은 카카오송금으로 원화 결제를 지원하며, 해외 고객을 위한 다양한 결제 수단도 순차적으로 제공할 예정이에요.',
    },
    highlights: {
      instant: {
        title: '즉시 확인',
        description: '카카오송금으로 스티치몬 로드샵 주문을 몇 초 만에 결제하고 확인할 수 있어요.',
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
      selectedCurrency: '선택한 통화: {currency}',
      selectCurrencyPrompt: '진행하려면 통화를 선택해 주세요.',
    },
    footer: {
      message: '© {year} 스티치몬 로드샵. 공식 온라인 결제 센터입니다.',
    },
    language: {
      label: '언어',
    },
    loading: {
      deepLink: '결제 앱을 여는 중이에요…',
    },
    popups: {
      deepLink: {
        titles: {
          notMobile: '모바일에서만 이용할 수 있어요',
          notInstalled: '앱이 실행되지 않았나요?',
        },
        confirms: {
          notMobile: '확인',
          notInstalled: '확인',
        },
        providers: {
          kakao: {
            notMobile: '카카오송금 링크는 모바일 카카오톡 앱에서만 열 수 있어요. 휴대폰에서 다시 시도해 주세요.',
            notInstalled:
              '카카오톡 앱으로 이동하지 않았다면 카카오톡 설치 여부를 확인한 후 다시 시도해 주세요.',
          },
          toss: {
            notMobile: '토스송금 링크는 모바일 토스 앱에서만 열 수 있어요. 휴대폰에서 다시 시도해 주세요.',
            notInstalled:
              '토스 앱으로 이동하지 않았다면 토스 앱 설치 여부를 확인한 후 다시 시도해 주세요.',
          },
        },
      },
    },
    currencySelector: {
      title: '통화를 선택하세요',
      description: '{method}로 사용할 통화를 선택해 주세요.',
      cancel: '닫기',
    },
    payment: {
      'kakao': {
        name: '카카오송금',
        description: '카카오톡으로 QR을 스캔하고 빠르게 결제하세요.',
        cta: '카카오송금 열기',
      },
      'toss': {
        name: '토스송금',
        description: '토스송금으로 바로 결제하고 즉시 확인하세요.',
        cta: '토스송금 열기',
      },
      'naver': {
        name: '네이버페이',
        description: '현장에서도 네이버페이 포인트로 간편하게 결제할 수 있도록 준비 중이에요.',
      },
      alipay: {
        name: '알리페이',
        description: '하나의 지갑으로 글로벌 주요 전자지갑을 연결해 결제를 지원할 계획이에요.',
      },
      paypal: {
        name: '페이팔',
        description: '글로벌 고객이 익숙한 PayPal 계정을 통해 손쉽게 결제할 수 있도록 준비하고 있어요.',
      },
      'card': {
        name: '신용카드',
        description: 'Visa, Mastercard, UnionPay, Amex, JCB 등 전 세계 카드 결제를 곧 제공할게요.',
      },
    },
  },
  ja: {
    hero: {
      kicker: 'スティッチモン ロードショップ',
      title: 'スティッチモンのご注文をお好みの方法で決済',
      badge: '公式オンライン決済',
      description:
        'ここはスティッチモン ロードショップの公式オンライン決済ページです。現在はKRW決済にKakao送金をご利用いただけ、海外のファン向けの手段も順次追加予定です。',
    },
    highlights: {
      instant: {
        title: '即時確認',
        description: 'Kakao送金でスティッチモンのご注文を数秒で決済し、その場で確認できます。',
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
      selectedCurrency: '選択した通貨: {currency}',
      selectCurrencyPrompt: '続行するには通貨を選択してください。',
    },
    footer: {
      message: '© {year} スティッチモン ロードショップ。公式オンライン決済センターです。',
    },
    language: {
      label: '言語',
    },
    loading: {
      deepLink: 'お支払いアプリを開いています…',
    },
    popups: {
      deepLink: {
        titles: {
          notMobile: 'モバイル専用です',
          notInstalled: 'アプリが起動しませんか？',
        },
        confirms: {
          notMobile: '了解',
          notInstalled: 'OK',
        },
        providers: {
          kakao: {
            notMobile:
              'Kakao送金リンクはモバイル版KakaoTalkアプリでのみ開けます。スマートフォンで再度お試しください。',
            notInstalled:
              'KakaoTalkに移動しなかった場合は、インストール状況を確認してからもう一度お試しください。',
          },
          toss: {
            notMobile:
              'Toss送金リンクはモバイル版Tossアプリでのみ開けます。スマートフォンで再度お試しください。',
            notInstalled:
              'Tossに移動しなかった場合は、インストール状況を確認してからもう一度お試しください。',
          },
        },
      },
    },
    currencySelector: {
      title: '通貨を選択',
      description: '{method}で利用する通貨を選んでください。',
      cancel: '閉じる',
    },
    payment: {
      'kakao': {
        name: 'Kakao送金',
        description: 'QRコードをKakaoTalkで読み取り、数秒で決済を完了できます。',
        cta: 'Kakao送金を開く',
      },
      'toss': {
        name: 'Toss送金',
        description: 'Toss送金ですぐにお支払いを済ませ、その場で確認できます。',
        cta: 'Toss送金を開く',
      },
      'naver': {
        name: 'Naver Pay',
        description: 'Naver Payでもその場でポイント決済できるよう準備中です。',
      },
      alipay: {
        name: 'Alipay（アリペイ）',
        description: 'Alipayを通じて主要な海外電子ウォレットを連携し、いつものウォレットで支払えるようにします。',
      },
      paypal: {
        name: 'PayPal（ペイパル）',
        description: '普段使いのPayPalアカウントで決済できるよう近日対応予定です。',
      },
      'card': {
        name: 'クレジットカード',
        description: 'Visa・Mastercard・UnionPay・Amex・JCBなどの世界的なカード決済に近日対応します。',
      },
    },
  },
  zh: {
    hero: {
      kicker: 'Stitchmon 路店',
      title: '用你喜欢的方式支付 Stitchmon 订单',
      badge: '官方在线结账',
      description:
        '这里是 Stitchmon 路店的官方在线支付页面。现在可以使用 Kakao 汇款 完成韩元订单，我们也在为全球的 Stitchmon 粉丝上线更多友好的支付选项。',
    },
    highlights: {
      instant: {
        title: '即时确认',
        description: '通过 Kakao 汇款 几秒内完成 Stitchmon 路店订单并立即确认。',
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
      selectedCurrency: '已选择的货币：{currency}',
      selectCurrencyPrompt: '请选择货币以继续。',
    },
    footer: {
      message: '© {year} Stitchmon 路店。官方在线支付中心。',
    },
    language: {
      label: '语言',
    },
    loading: {
      deepLink: '正在打开支付应用程序…',
    },
    popups: {
      deepLink: {
        titles: {
          notMobile: '仅限移动设备使用',
          notInstalled: '应用没有打开吗？',
        },
        confirms: {
          notMobile: '知道了',
          notInstalled: '好的',
        },
        providers: {
          kakao: {
            notMobile: 'Kakao 汇款链接只能在手机上的 KakaoTalk 应用中打开。请在手机上重试。',
            notInstalled: '如果没有跳转到 KakaoTalk，请确认已安装 KakaoTalk 后再试一次。',
          },
          toss: {
            notMobile: 'Toss 转账链接只能在手机上的 Toss 应用中打开。请在手机上重试。',
            notInstalled: '如果没有跳转到 Toss，请确认已安装 Toss 后再试一次。',
          },
        },
      },
    },
    currencySelector: {
      title: '选择货币',
      description: '请选择使用 {method} 时的付款货币。',
      cancel: '关闭',
    },
    payment: {
      'kakao': {
        name: 'Kakao 汇款',
        description: '使用 KakaoTalk 扫描二维码，数秒内完成结账。',
        cta: '打开 Kakao 汇款',
      },
      'toss': {
        name: 'Toss 转账',
        description: '通过 Toss 转账即时付款并立即确认。',
        cta: '打开 Toss',
      },
      'naver': {
        name: 'Naver Pay',
        description: '我们正在筹备 Naver Pay，让你当场即可使用积分付款。',
      },
      alipay: {
        name: '支付宝',
        description: '我们计划通过 Alipay 接入主要的全球电子钱包，让旅客可以用熟悉的钱包付款。',
      },
      paypal: {
        name: 'PayPal',
        description: '你很快就能用熟悉的 PayPal 账户轻松完成购买。',
      },
      'card': {
        name: '信用卡',
        description: '我们即将上线 Visa、Mastercard、UnionPay、Amex、JCB 等全球银行卡支付，让你随时享受熟悉的结账体验。',
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
  } catch {
    return undefined
  }
}

const persistLocale = (value: Locale) => {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, value)
  } catch {
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
