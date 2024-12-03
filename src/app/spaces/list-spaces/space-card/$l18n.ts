import type { Translations } from '@/l18n'

export type Text = {
  'space-card.live': string
  'space-card.people-count': (count: number) => string
}

export const translations: Translations<Text> = {
  en: {
    'space-card.live': 'Live',
    'space-card.people-count': (count) => `${count.toLocaleString()} people`
  },
  ar: {
    'space-card.live': 'حي',
    'space-card.people-count': (count) => `${count.toLocaleString()} أشخاص`
  },
  de: {
    'space-card.live': 'Live',
    'space-card.people-count': (count) => `${count.toLocaleString()} Personen`
  },
  es: {
    'space-card.live': 'En vivo',
    'space-card.people-count': (count) => `${count.toLocaleString()} personas`
  },
  fr: {
    'space-card.live': 'En direct',
    'space-card.people-count': (count) => `${count.toLocaleString()} personnes`
  },
  hi: {
    'space-card.live': 'लाइव',
    'space-card.people-count': (count) => `${count.toLocaleString()} लोग`
  },
  it: {
    'space-card.live': 'Dal vivo',
    'space-card.people-count': (count) => `${count.toLocaleString()} persone`
  },
  ja: {
    'space-card.live': 'ライブ',
    'space-card.people-count': (count) => `${count.toLocaleString()} 人`
  },
  ko: {
    'space-card.live': '실시간',
    'space-card.people-count': (count) => `${count.toLocaleString()} 명`
  },
  pt: {
    'space-card.live': 'Ao vivo',
    'space-card.people-count': (count) => `${count.toLocaleString()} pessoas`
  },
  ru: {
    'space-card.live': 'Прямой эфир',
    'space-card.people-count': (count) => `${count.toLocaleString()} человек`
  },
  zh: {
    'space-card.live': '现场',
    'space-card.people-count': (count) => `${count.toLocaleString()} 人`
  }
}
