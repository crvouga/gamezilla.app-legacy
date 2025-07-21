import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.no-packs': string
  'game.numberlink.puzzle-count': (count: number) => string
}

export const translations: Translations<Text> = {
  ar: {
    'game.numberlink.no-packs': 'لا توجد حزم',
    'game.numberlink.puzzle-count': (count) => `${count} ألغاز`,
  },
  de: {
    'game.numberlink.no-packs': 'Keine Packs',
    'game.numberlink.puzzle-count': (count) => `${count} Rätsel`,
  },
  en: {
    'game.numberlink.no-packs': 'No packs',
    'game.numberlink.puzzle-count': (count) => (count === 1 ? `${count} puzzle` : `${count} puzzles`),
  },
  es: {
    'game.numberlink.no-packs': 'Sin paquetes',
    'game.numberlink.puzzle-count': (count) => `${count} rompecabezas`,
  },
  fr: {
    'game.numberlink.no-packs': 'Aucun pack',
    'game.numberlink.puzzle-count': (count) => `${count} puzzles`,
  },
  hi: {
    'game.numberlink.no-packs': 'कोई पैक नहीं',
    'game.numberlink.puzzle-count': (count) => `${count} पहेलियाँ`,
  },
  it: {
    'game.numberlink.no-packs': 'Nessun pacchetto',
    'game.numberlink.puzzle-count': (count) => `${count} puzzle`,
  },
  ja: {
    'game.numberlink.no-packs': 'パックなし',
    'game.numberlink.puzzle-count': (count) => `${count} パズル`,
  },
  ko: {
    'game.numberlink.no-packs': '팩 없음',
    'game.numberlink.puzzle-count': (count) => `${count} 퍼즐`,
  },
  pt: {
    'game.numberlink.no-packs': 'Sem pacotes',
    'game.numberlink.puzzle-count': (count) => `${count} quebra-cabeças`,
  },
  ru: {
    'game.numberlink.no-packs': 'Нет пакетов',
    'game.numberlink.puzzle-count': (count) => `${count} головоломок`,
  },
  zh: {
    'game.numberlink.no-packs': '没有包',
    'game.numberlink.puzzle-count': (count) => `${count} 拼图`,
  },
}
