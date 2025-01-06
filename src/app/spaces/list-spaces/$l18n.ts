import type { Translations } from '~/@/l18n'

export type Text = {
  'spaces.spaces': string
  'spaces.no-spaces': string
}

export const translations: Translations<Text> = {
  ar: {
    'spaces.spaces': 'الفضاءات',
    'spaces.no-spaces': 'لا توجد مساحات',
  },
  de: {
    'spaces.spaces': 'Räume',
    'spaces.no-spaces': 'Keine Räume',
  },
  en: {
    'spaces.spaces': 'Spaces',
    'spaces.no-spaces': 'No spaces',
  },
  es: {
    'spaces.spaces': 'Espacios',
    'spaces.no-spaces': 'Sin espacios',
  },
  fr: {
    'spaces.spaces': 'Espaces',
    'spaces.no-spaces': 'Aucun espace',
  },
  hi: {
    'spaces.spaces': 'स्थान',
    'spaces.no-spaces': 'कोई स्थान नहीं',
  },
  it: {
    'spaces.spaces': 'Spazi',
    'spaces.no-spaces': 'Nessuno spazio',
  },
  ja: {
    'spaces.spaces': 'スペース',
    'spaces.no-spaces': 'スペースなし',
  },
  ko: {
    'spaces.spaces': '공간',
    'spaces.no-spaces': '공간 없음',
  },
  pt: {
    'spaces.spaces': 'Espaços',
    'spaces.no-spaces': 'Sem espaços',
  },
  ru: {
    'spaces.spaces': 'Пространства',
    'spaces.no-spaces': 'Нет пространств',
  },
  zh: {
    'spaces.spaces': '空间',
    'spaces.no-spaces': '没有空间',
  },
}
