import type { Translations } from '~/@/l18n'

export type Text = {
  'flow.no-packs': string
  'flow.puzzle-count': (count: number) => string
}

export const translations: Translations<Text> = {
  ar: {
    'flow.no-packs': 'لا توجد حزم',
    'flow.puzzle-count': (count) => `${count} ألغاز`,
  },
  de: {
    'flow.no-packs': 'Keine Packs',
    'flow.puzzle-count': (count) => `${count} Rätsel`,
  },
  en: {
    'flow.no-packs': 'No packs',
    'flow.puzzle-count': (count) => (count === 1 ? `${count} puzzle` : `${count} puzzles`),
  },
  es: {
    'flow.no-packs': 'Sin paquetes',
    'flow.puzzle-count': (count) => `${count} rompecabezas`,
  },
  fr: {
    'flow.no-packs': 'Aucun pack',
    'flow.puzzle-count': (count) => `${count} puzzles`,
  },
  hi: {
    'flow.no-packs': 'कोई पैक नहीं',
    'flow.puzzle-count': (count) => `${count} पहेलियाँ`,
  },
  it: {
    'flow.no-packs': 'Nessun pacchetto',
    'flow.puzzle-count': (count) => `${count} puzzle`,
  },
  ja: {
    'flow.no-packs': 'パックなし',
    'flow.puzzle-count': (count) => `${count} パズル`,
  },
  ko: {
    'flow.no-packs': '팩 없음',
    'flow.puzzle-count': (count) => `${count} 퍼즐`,
  },
  pt: {
    'flow.no-packs': 'Sem pacotes',
    'flow.puzzle-count': (count) => `${count} quebra-cabeças`,
  },
  ru: {
    'flow.no-packs': 'Нет пакетов',
    'flow.puzzle-count': (count) => `${count} головоломок`,
  },
  zh: {
    'flow.no-packs': '没有包',
    'flow.puzzle-count': (count) => `${count} 拼图`,
  },
}
