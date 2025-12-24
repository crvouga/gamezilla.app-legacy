import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.add-puzzle': string
  'game.numberlink.puzzle-removed': string
  'game.numberlink.puzzle-added': string
  'game.numberlink.remove-from-pack': string
}

export const translations: Translations<Text> = {
  'game.numberlink.add-puzzle': {
    en: 'Add Puzzle',
    es: 'Agregar rompecabezas',
    fr: 'Ajouter',
    de: 'Puzzle hinzufügen',
    it: 'Aggiungi Puzzle',
    ja: 'パズルを追加',
    ko: '퍼즐 추가',
    pt: 'Adicionar quebra-cabeça',
    ru: 'Добавить головоломку',
    zh: '添加拼图',
    hi: 'पहेली जोड़ें',
    ar: 'إضافة لغز',
  },
  'game.numberlink.puzzle-added': {
    en: 'Puzzle added',
    es: 'Rompecabezas añadido',
    fr: 'Puzzle ajouté',
    de: 'Rätsel hinzugefügt',
    it: 'Puzzle aggiunto',
    ja: 'パズルが追加されました',
    ko: '퍼즐이 추가되었습니다',
    pt: 'Quebra-cabeça adicionado',
    ru: 'Головоломка добавлена',
    zh: '拼图已添加',
    hi: 'पहेली जोड़ी गई',
    ar: 'تمت إضافة اللغز',
  },
  'game.numberlink.puzzle-removed': {
    en: 'Puzzle removed',
    es: 'Rompecabezas eliminado',
    fr: 'Puzzle supprimé',
    de: 'Rätsel entfernt',
    it: 'Puzzle rimosso',
    ja: 'パズルが削除されました',
    ko: '퍼즐이 제거되었습니다',
    pt: 'Quebra-cabeça removido',
    ru: 'Головоломка удалена',
    zh: '拼图已删除',
    hi: 'पहेली हटा दी गई',
    ar: 'تمت إزالة اللغز',
  },
  'game.numberlink.remove-from-pack': {
    en: 'Remove from pack',
    es: 'Eliminar del paquete',
    fr: 'Retirer du pack',
    de: 'Aus Packung entfernen',
    it: 'Rimuovi dal pacchetto',
    ja: 'パックから削除',
    ko: '팩에서 제거',
    pt: 'Remover do pacote',
    ru: 'Удалить из пакета',
    zh: '从包中删除',
    hi: 'पैक से हटाएं',
    ar: 'إزالة من الحزمة',
  },
}
