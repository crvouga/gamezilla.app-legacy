import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.no-puzzles': string
  'game.numberlink.puzzles-selected': (input: { totalCount: number; selectedCount: number }) => string
}

export const translations: Translations<Text> = {
  'game.numberlink.no-puzzles': {
    en: 'No puzzles',
    es: 'Sin rompecabezas',
    fr: 'Aucun puzzle',
    de: 'Keine Puzzles',
    it: 'Nessun puzzle',
    ja: 'パズルなし',
    ko: '퍼즐이 없습니다',
    pt: 'Sem quebra-cabeças',
    ru: 'Нет пазлов',
    zh: '没有拼图',
    hi: 'कोई पहेली नहीं',
    ar: 'لا توجد ألغاز',
  },
  'game.numberlink.puzzles-selected': {
    en: ({ totalCount, selectedCount }) => `${selectedCount} of ${totalCount} selected`,
    es: ({ totalCount, selectedCount }) => `${selectedCount} de ${totalCount} seleccionados`,
    fr: ({ totalCount, selectedCount }) => `${selectedCount} de ${totalCount} s\xE9lectionn\xE9s`,
    de: ({ totalCount, selectedCount }) => `${selectedCount} von ${totalCount} ausgew\xE4hlt`,
    it: ({ totalCount, selectedCount }) => `${selectedCount} di ${totalCount} selezionati`,
    ja: ({ totalCount, selectedCount }) =>
      `${selectedCount} / ${totalCount} \u304C\u9078\u629E\u3055\u308C\u307E\u3057\u305F`,
    ko: ({ totalCount, selectedCount }) => `${selectedCount} / ${totalCount} \uC120\uD0DD\uB428`,
    pt: ({ totalCount, selectedCount }) => `${selectedCount} de ${totalCount} selecionados`,
    ru: ({ totalCount, selectedCount }) =>
      `${selectedCount} \u0438\u0437 ${totalCount} \u0432\u044B\u0431\u0440\u0430\u043D\u043E`,
    zh: ({ totalCount, selectedCount }) =>
      `\u5DF2\u9009\u62E9 ${selectedCount} \u4E2A\uFF0C\u5171 ${totalCount} \u4E2A`,
    hi: ({ totalCount, selectedCount }) => `${selectedCount} \u0915\u093E ${totalCount} \u091A\u092F\u0928\u093F\u0924`,
    ar: ({ totalCount, selectedCount }) =>
      `${selectedCount} \u0645\u0646 ${totalCount} \u062A\u0645 \u062A\u062D\u062F\u064A\u062F\u0647\u0627`,
  },
}
