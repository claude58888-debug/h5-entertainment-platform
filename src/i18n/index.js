import { createI18n } from 'vue-i18n'
import zh from './zh'
import en from './en'

const savedLocale = localStorage.getItem('lang') || 'zh'

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    zh,
    en
  }
})

export default i18n
