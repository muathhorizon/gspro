
import { createI18n } from 'vue-i18n'

import ar from './locales/ar.json'
import en from './locales/en.json'

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  allowComposition: true,
  locale: 'ar', 
  fallbackLocale: 'en',
  messages: {
    ar,
    en
  },

  runtimeOnly: false,
  compositionOnly: false,
  warnHtmlMessage: false,

  escapeParameter: false,
  missingWarn: false,
  fallbackWarn: false
})

export default i18n
