import type { Translations } from '~/@/l18n'
import type { PackName } from './pack-name'

export type Text = {
  'numberlink-pack-name': (packName: PackName) => string
}

export const translations: Translations<Text> = {
  'numberlink-pack-name': {
    en: (packName) => `${packName}`,
    es: (packName) => `${packName}`,
    fr: (packName) => `${packName}`,
    de: (packName) => `${packName}`,
    it: (packName) => `${packName}`,
    ja: (packName) => `${packName}`,
    ko: (packName) => `${packName}`,
    pt: (packName) => `${packName}`,
    ru: (packName) => `${packName}`,
    zh: (packName) => `${packName}`,
    hi: (packName) => `${packName}`,
    ar: (packName) => `${packName}`,
  },
}
