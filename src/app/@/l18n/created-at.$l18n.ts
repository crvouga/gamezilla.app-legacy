import type { TranslatedText, Translations } from '~/@/l18n'

export type Text = {
  'app.created-at': (timeSpanDescription: TranslatedText) => string
}

export const translations: Translations<Text> = {
  'app.created-at': {
    en: (timeSpanDescription) => `Created ${timeSpanDescription.toLowerCase()}`,
    es: (timeSpanDescription) => `Creado ${timeSpanDescription}`,
    fr: (timeSpanDescription) => `Cr\xE9\xE9 ${timeSpanDescription}`,
    de: (timeSpanDescription) => `Erstellt ${timeSpanDescription}`,
    it: (timeSpanDescription) => `Creato ${timeSpanDescription}`,
    ja: (timeSpanDescription) => `\u4F5C\u6210\u65E5 ${timeSpanDescription}`,
    ko: (timeSpanDescription) => `\uC0DD\uC131 ${timeSpanDescription}`,
    pt: (timeSpanDescription) => `Criado ${timeSpanDescription}`,
    ru: (timeSpanDescription) => `\u0421\u043E\u0437\u0434\u0430\u043D\u043E ${timeSpanDescription}`,
    zh: (timeSpanDescription) => `\u521B\u5EFA\u4E8E ${timeSpanDescription}`,
    hi: (timeSpanDescription) => `\u092C\u0928\u093E\u092F\u093E \u0917\u092F\u093E ${timeSpanDescription}`,
    ar: (timeSpanDescription) => `\u062A\u0645 \u0627\u0644\u0625\u0646\u0634\u0627\u0621 ${timeSpanDescription}`,
  },
}

