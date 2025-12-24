import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.no-packs': string
  'game.numberlink.puzzle-count': (count: number) => string
}

export const translations: Translations<Text> = {
  'game.numberlink.no-packs': {
    en: 'No packs',
    es: 'Sin paquetes',
    fr: 'Aucun pack',
    de: 'Keine Packs',
    it: 'Nessun pacchetto',
    ja: 'パックなし',
    ko: '팩 없음',
    pt: 'Sem pacotes',
    ru: 'Нет пакетов',
    zh: '没有包',
    hi: 'कोई पैक नहीं',
    ar: 'لا توجد حزم',
  },
  'game.numberlink.puzzle-count': {
    en: (count) => (count === 1 ? `${count} puzzle` : `${count} puzzles`),
    es: (count) => `${count} rompecabezas`,
    fr: (count) => `${count} puzzles`,
    de: (count) => `${count} R\xE4tsel`,
    it: (count) => `${count} puzzle`,
    ja: (count) => `${count} \u30D1\u30BA\u30EB`,
    ko: (count) => `${count} \uD37C\uC990`,
    pt: (count) => `${count} quebra-cabe\xE7as`,
    ru: (count) => `${count} \u0433\u043E\u043B\u043E\u0432\u043E\u043B\u043E\u043C\u043E\u043A`,
    zh: (count) => `${count} \u62FC\u56FE`,
    hi: (count) => `${count} \u092A\u0939\u0947\u0932\u093F\u092F\u093E\u0901`,
    ar: (count) => `${count} \u0623\u0644\u063A\u0627\u0632`,
  },
}
