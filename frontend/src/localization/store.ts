import { ref } from 'vue'
import { defineStore } from 'pinia'

export const LOCALES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
] as const

export type Locale = (typeof LOCALES)[number]['code']

export type Messages = {
  [key: string]: string | Messages
}

const LOCALE_QUERY_KEY = 'lang'

const localeLoaders: Record<Locale, () => Promise<Messages>> = {
  en: () => import('./messages/en.json').then((module) => module.default as Messages),
  ko: () => import('./messages/ko.json').then((module) => module.default as Messages),
  ja: () => import('./messages/ja.json').then((module) => module.default as Messages),
  zh: () => import('./messages/zh.json').then((module) => module.default as Messages),
}

const messageCache = new Map<Locale, Messages>()
let pendingLoad: Promise<Messages> | null = null

const isSupportedLocale = (value: string): value is Locale =>
  LOCALES.some((locale) => locale.code === value)

const readLocaleFromQuery = (): Locale | undefined => {
  if (typeof window === 'undefined') {
    return undefined
  }

  try {
    const url = new URL(window.location.href)
    const queryLocale = url.searchParams.get(LOCALE_QUERY_KEY)

    if (queryLocale && isSupportedLocale(queryLocale)) {
      return queryLocale
    }

    return undefined
  } catch {
    return undefined
  }
}

const updateLocaleQuery = (value: Locale) => {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const url = new URL(window.location.href)
    url.searchParams.set(LOCALE_QUERY_KEY, value)
    window.history.replaceState({}, '', url.toString())
  } catch {
    // Ignore navigation errors (e.g., unsupported history API)
  }
}

const matchLocale = (language: string): Locale | undefined => {
  const normalized = language.toLowerCase()
  return LOCALES.find((locale) => normalized.startsWith(locale.code))?.code
}

const resolveInitialLocale = (): Locale => {
  const fromQuery = readLocaleFromQuery()
  if (fromQuery) {
    return fromQuery
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

const loadMessages = async (locale: Locale): Promise<Messages> => {
  if (messageCache.has(locale)) {
    return messageCache.get(locale) as Messages
  }

  pendingLoad = localeLoaders[locale]().then((data) => {
    messageCache.set(locale, data)
    return data
  })

  try {
    return await pendingLoad
  } finally {
    pendingLoad = null
  }
}

const readMessage = (messages: Messages | undefined, key: string): string | undefined => {
  if (!messages) {
    return undefined
  }

  const segments = key.split('.')
  let current: Messages | string | undefined = messages

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
  const activeMessages = ref<Messages | null>(null)

  const ensureFallbackLoaded = async () => {
    if (!messageCache.has('en')) {
      await loadMessages('en')
    }
  }

  const setActiveLocale = async (next: Locale) => {
    await ensureFallbackLoaded()
    const messages = await loadMessages(next)
    if (locale.value === next) {
      activeMessages.value = messages
    }
  }

  const initialize = async () => {
    await ensureFallbackLoaded()
    await setActiveLocale(locale.value)
  }

  const setLocale = async (next: Locale) => {
    if (!isSupportedLocale(next) || next === locale.value) {
      return
    }

    locale.value = next
    updateLocaleQuery(next)
    await setActiveLocale(next)
  }

  const t = (key: string, fallback?: string): string => {
    const localized = readMessage(activeMessages.value ?? undefined, key)
    if (localized) {
      return localized
    }

    const base = readMessage(messageCache.get('en'), key)
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
    initialize,
    setLocale,
    t,
  }
})
