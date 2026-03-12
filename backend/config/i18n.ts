import path from 'node:path'
import i18n from 'i18n'
import { type Express } from 'express'

export type SupportedLanguage = {
  code: string
  label: string
  nativeLabel: string
}

export const supportedLanguages: SupportedLanguage[] = [
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

let isConfigured = false

export function configureI18n(app: Express): void {
  if (isConfigured) {
    return
  }

  i18n.configure({
    locales: supportedLanguages.map((language) => language.code),
    defaultLocale: 'en',
    objectNotation: false,
    updateFiles: false,
    syncFiles: false,
    directory: path.resolve(process.cwd(), 'backend/locales'),
    register: global
  })

  app.use(i18n.init)
  isConfigured = true
}
