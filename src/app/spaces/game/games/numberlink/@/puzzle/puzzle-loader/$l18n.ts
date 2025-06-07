import type { Translations } from '~/@/l18n'

export type Text = {
  'flow.no-puzzles': string
  'flow.puzzles-selected': (input: { totalCount: number; selectedCount: number }) => string
}

export const translations: Translations<Text> = {
  ar: {
    'flow.no-puzzles': 'لا توجد ألغاز',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} من ${totalCount} تم تحديدها`,
  },
  de: {
    'flow.no-puzzles': 'Keine Puzzles',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} von ${totalCount} ausgewählt`,
  },
  en: {
    'flow.no-puzzles': 'No puzzles',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} of ${totalCount} selected`,
  },
  es: {
    'flow.no-puzzles': 'Sin rompecabezas',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} de ${totalCount} seleccionados`,
  },
  fr: {
    'flow.no-puzzles': 'Aucun puzzle',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} de ${totalCount} sélectionnés`,
  },
  hi: {
    'flow.no-puzzles': 'कोई पहेली नहीं',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} का ${totalCount} चयनित`,
  },
  it: {
    'flow.no-puzzles': 'Nessun puzzle',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} di ${totalCount} selezionati`,
  },
  ja: {
    'flow.no-puzzles': 'パズルなし',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} / ${totalCount} が選択されました`,
  },

  ko: {
    'flow.no-puzzles': '퍼즐이 없습니다',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} / ${totalCount} 선택됨`,
  },
  pt: {
    'flow.no-puzzles': 'Sem quebra-cabeças',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} de ${totalCount} selecionados`,
  },
  ru: {
    'flow.no-puzzles': 'Нет пазлов',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `${selectedCount} из ${totalCount} выбрано`,
  },
  zh: {
    'flow.no-puzzles': '没有拼图',
    'flow.puzzles-selected': ({ totalCount, selectedCount }) => `已选择 ${selectedCount} 个，共 ${totalCount} 个`,
  },
}
