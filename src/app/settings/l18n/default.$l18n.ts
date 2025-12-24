import type { Translations } from '~/@/l18n'

export type Text = {
  'l18n.default': string
}

export const translations: Translations<Text> = {
  'l18n.default': {
    en: 'Default',
    es: 'Predeterminado',
    fr: 'Par défaut',
    de: 'Standard',
    it: 'Predefinito',
    ja: 'デフォルト',
    ko: '기본값',
    pt: 'Padrão',
    ru: 'По умолчанию',
    zh: '默认',
    hi: 'डिफ़ॉल्ट',
    ar: 'افتراضي',
  },
}
