import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.no-puzzles': string
  'game.numberlink.puzzles-selected': (input: { totalCount: number; selectedCount: number }) => string
}

export const translations: Translations<Text> = {
  ar: {
    'game.numberlink.no-puzzles': 'لا توجد ألغاز',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) =>
      `${selectedCount} من ${totalCount} تم تحديدها`,
  },
  de: {
    'game.numberlink.no-puzzles': 'Keine Puzzles',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) =>
      `${selectedCount} von ${totalCount} ausgewählt`,
  },
  en: {
    'game.numberlink.no-puzzles': 'No puzzles',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} of ${totalCount} selected`,
  },
  es: {
    'game.numberlink.no-puzzles': 'Sin rompecabezas',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) =>
      `${selectedCount} de ${totalCount} seleccionados`,
  },
  fr: {
    'game.numberlink.no-puzzles': 'Aucun puzzle',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) =>
      `${selectedCount} de ${totalCount} sélectionnés`,
  },
  hi: {
    'game.numberlink.no-puzzles': 'कोई पहेली नहीं',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} का ${totalCount} चयनित`,
  },
  it: {
    'game.numberlink.no-puzzles': 'Nessun puzzle',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) =>
      `${selectedCount} di ${totalCount} selezionati`,
  },
  ja: {
    'game.numberlink.no-puzzles': 'パズルなし',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) =>
      `${selectedCount} / ${totalCount} が選択されました`,
  },

  ko: {
    'game.numberlink.no-puzzles': '퍼즐이 없습니다',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} / ${totalCount} 선택됨`,
  },
  pt: {
    'game.numberlink.no-puzzles': 'Sem quebra-cabeças',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) =>
      `${selectedCount} de ${totalCount} selecionados`,
  },
  ru: {
    'game.numberlink.no-puzzles': 'Нет пазлов',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} из ${totalCount} выбрано`,
  },
  zh: {
    'game.numberlink.no-puzzles': '没有拼图',
    'game.numberlink.puzzles-selected': ({ totalCount, selectedCount }) =>
      `已选择 ${selectedCount} 个，共 ${totalCount} 个`,
  },
}
