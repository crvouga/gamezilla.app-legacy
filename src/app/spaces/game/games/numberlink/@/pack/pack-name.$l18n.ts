import type { Translations } from '~/@/l18n'
import type { PackName } from './pack-name'

export type Text = {
  'numberlink-pack-name': (packName: PackName) => string
}

export const translations: Translations<Text> = {
  ar: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  de: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  en: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  es: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  fr: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  hi: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  it: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  ja: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  ko: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  pt: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  ru: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
  zh: {
    'numberlink-pack-name': (packName) => `${packName}`,
  },
}
