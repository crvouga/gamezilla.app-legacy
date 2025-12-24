import type { Translations } from '~/@/l18n'

export type Text = {
  'space-card.live': string
  'space-card.people-count': (count: number) => string
}

export const translations: Translations<Text> = {
  'space-card.live': {
    en: 'Live',
    es: 'En vivo',
    fr: 'En direct',
    de: 'Live',
    it: 'Dal vivo',
    ja: 'ライブ',
    ko: '실시간',
    pt: 'Ao vivo',
    ru: 'Прямой эфир',
    zh: '现场',
    hi: 'लाइव',
    ar: 'حي',
  },
  'space-card.people-count': {
    en: (count) => `${count.toLocaleString()} people`,
    es: (count) => `${count.toLocaleString()} personas`,
    fr: (count) => `${count.toLocaleString()} personnes`,
    de: (count) => `${count.toLocaleString()} Personen`,
    it: (count) => `${count.toLocaleString()} persone`,
    ja: (count) => `${count.toLocaleString()} \u4EBA`,
    ko: (count) => `${count.toLocaleString()} \uBA85`,
    pt: (count) => `${count.toLocaleString()} pessoas`,
    ru: (count) => `${count.toLocaleString()} \u0447\u0435\u043B\u043E\u0432\u0435\u043A`,
    zh: (count) => `${count.toLocaleString()} \u4EBA`,
    hi: (count) => `${count.toLocaleString()} \u0932\u094B\u0917`,
    ar: (count) => `${count.toLocaleString()} \u0623\u0634\u062E\u0627\u0635`,
  },
}
