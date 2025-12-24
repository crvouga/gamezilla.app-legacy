import { Translations } from '~/@/l18n'

export type Text = {
  'app.+number': (number: number) => string
}

export const translations: Translations<Text> = {
  'app.+number': {
    en: (number) => `+${number.toLocaleString()}`,
    es: (number) => `+${number.toLocaleString()}`,
    fr: (number) => `+${number.toLocaleString()}`,
    de: (number) => `+${number.toLocaleString()}`,
    it: (number) => `+${number.toLocaleString()}`,
    ja: (number) => `+${number.toLocaleString()}`,
    ko: (number) => `+${number.toLocaleString()}`,
    pt: (number) => `+${number.toLocaleString()}`,
    ru: (number) => `+${number.toLocaleString()}`,
    zh: (number) => `+${number.toLocaleString()}`,
    hi: (number) => `+${number.toLocaleString()}`,
    ar: (number) => `+${number.toLocaleString()}`,
  },
}

