import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { useLocation } from 'react-router-dom'
import { apiUrl } from '../config/api'

export type SupportedLanguage = {
  code: string
  label: string
  nativeLabel: string
}

type TranslationContextValue = {
  currentLanguage: string
  supportedLanguages: SupportedLanguage[]
  isReady: boolean
  setLanguage: (languageCode: string) => Promise<void>
}

const DEFAULT_LANGUAGE = 'en'
const TRANSLATION_STORAGE_KEY = 'finovo-language'
const GOOGLE_TRANSLATE_ELEMENT_ID = 'google_translate_element'
const FALLBACK_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'zh-CN', label: 'Chinese (Simplified)', nativeLabel: '简体中文' }
]

const TranslationContext = createContext<TranslationContextValue | undefined>(undefined)

let scriptPromise: Promise<void> | null = null
let widgetInitialized = false

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement?: new (options: Record<string, unknown>, elementId: string) => unknown
        TranslateElement?: {
          InlineLayout: {
            SIMPLE: unknown
          }
        }
      }
    }
    googleTranslateElementInit?: () => void
  }
}

const getGoogleCombo = (): HTMLSelectElement | null => document.querySelector('.goog-te-combo')

const setGoogleTranslateCookie = (languageCode: string) => {
  const value = `/en/${languageCode}`
  document.cookie = `googtrans=${value};path=/`
  document.cookie = `googtrans=${value};domain=${window.location.hostname};path=/`
}

const clearGoogleTranslateCookie = () => {
  document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=${window.location.hostname}; path=/`
}

const initializeGoogleWidget = (languageCodes: string[]) => {
  if (widgetInitialized || !window.google?.translate?.TranslateElement) {
    return
  }

  const container = document.getElementById(GOOGLE_TRANSLATE_ELEMENT_ID)
  if (!container) {
    return
  }

  container.innerHTML = ''
  const TranslateElement = window.google.translate.TranslateElement as unknown as new (
    options: Record<string, unknown>,
    elementId: string
  ) => unknown
  const InlineLayout = (window.google.translate.TranslateElement as unknown as { InlineLayout: { SIMPLE: unknown } }).InlineLayout

  new TranslateElement(
    {
      pageLanguage: 'en',
      includedLanguages: languageCodes.join(','),
      autoDisplay: false,
      layout: InlineLayout.SIMPLE
    },
    GOOGLE_TRANSLATE_ELEMENT_ID
  )

  widgetInitialized = true
}

const ensureGoogleTranslate = (languageCodes: string[]): Promise<void> => {
  if (window.google?.translate?.TranslateElement) {
    initializeGoogleWidget(languageCodes)
    return Promise.resolve()
  }

  if (scriptPromise) {
    return scriptPromise.then(() => {
      initializeGoogleWidget(languageCodes)
    })
  }

  scriptPromise = new Promise((resolve, reject) => {
    window.googleTranslateElementInit = () => {
      initializeGoogleWidget(languageCodes)
      resolve()
    }

    const script = document.createElement('script')
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    script.async = true
    script.onerror = () => reject(new Error('Failed to load Google Translate script'))
    document.body.appendChild(script)
  })

  return scriptPromise
}

const applyGoogleTranslation = async (languageCode: string, languageCodes: string[]) => {
  if (languageCode === DEFAULT_LANGUAGE) {
    clearGoogleTranslateCookie()
    localStorage.setItem(TRANSLATION_STORAGE_KEY, DEFAULT_LANGUAGE)
    window.location.reload()
    return
  }

  setGoogleTranslateCookie(languageCode)
  await ensureGoogleTranslate(languageCodes)

  const attemptSelection = (remainingAttempts: number) => {
    const combo = getGoogleCombo()

    if (combo) {
      combo.value = languageCode
      combo.dispatchEvent(new Event('change'))
      localStorage.setItem(TRANSLATION_STORAGE_KEY, languageCode)
      return
    }

    if (remainingAttempts > 0) {
      window.setTimeout(() => attemptSelection(remainingAttempts - 1), 250)
    }
  }

  attemptSelection(12)
}

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>(FALLBACK_LANGUAGES)
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_LANGUAGE
    }

    return localStorage.getItem(TRANSLATION_STORAGE_KEY) ?? DEFAULT_LANGUAGE
  })
  const [isReady, setIsReady] = useState(false)

  const languageCodes = useMemo(() => supportedLanguages.map((language) => language.code), [supportedLanguages])

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        const response = await axios.get<{ defaultLocale: string; languages: SupportedLanguage[] }>(apiUrl('/api/i18n/locales'))
        if (response.data.languages?.length) {
          setSupportedLanguages(response.data.languages)
        }
      } catch {
        setSupportedLanguages(FALLBACK_LANGUAGES)
      } finally {
        setIsReady(true)
      }
    }

    void loadLanguages()
  }, [])

  useEffect(() => {
    if (!isReady || currentLanguage === DEFAULT_LANGUAGE) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void applyGoogleTranslation(currentLanguage, languageCodes)
    }, 200)

    return () => window.clearTimeout(timeoutId)
  }, [currentLanguage, isReady, languageCodes, location.pathname, location.search])

  const setLanguage = async (languageCode: string) => {
    setCurrentLanguage(languageCode)
    await applyGoogleTranslation(languageCode, languageCodes)
  }

  const value = useMemo<TranslationContextValue>(
    () => ({
      currentLanguage,
      supportedLanguages,
      isReady,
      setLanguage
    }),
    [currentLanguage, isReady, supportedLanguages]
  )

  return (
    <TranslationContext.Provider value={value}>
      {children}
      <div id={GOOGLE_TRANSLATE_ELEMENT_ID} className="hidden" aria-hidden="true" />
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)

  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider')
  }

  return context
}
