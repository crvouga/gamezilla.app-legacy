import type { Translations } from '~/@/l18n'

export type Text = {
  'spaces.spaces': string
  'spaces.no-spaces': string
}

export const translations: Translations<Text> = {
  'spaces.no-spaces': {
    en: 'No spaces',
    es: 'Sin espacios',
    fr: 'Aucun espace',
    de: 'Keine Räume',
    it: 'Nessuno spazio',
    ja: 'スペースなし',
    ko: '공간 없음',
    pt: 'Sem espaços',
    ru: 'Нет пространств',
    zh: '没有空间',
    hi: 'कोई स्थान नहीं',
    ar: 'لا توجد مساحات',
  },
  'spaces.spaces': {
    en: 'Spaces',
    es: 'Espacios',
    fr: 'Espaces',
    de: 'Räume',
    it: 'Spazi',
    ja: 'スペース',
    ko: '공간',
    pt: 'Espaços',
    ru: 'Пространства',
    zh: '空间',
    hi: 'स्थान',
    ar: 'الفضاءات',
  },
}
