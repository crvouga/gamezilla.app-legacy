import type { Translations } from '~/@/l18n'
import type { PackName } from './pack-name'

export type Text = {
  'numberlink-pack-name': (flowPackName: PackName) => string
}

export const translations: Translations<Text> = {
  ar: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  de: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  en: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  es: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  fr: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  hi: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  it: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  ja: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  ko: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  pt: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  ru: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
  zh: {
    'numberlink-pack-name': (flowPackName) => `${flowPackName}`,
  },
}
