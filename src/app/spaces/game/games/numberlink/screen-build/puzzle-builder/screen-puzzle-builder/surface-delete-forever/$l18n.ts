import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.puzzle-deleted': string
  'game.numberlink.delete-puzzle-forever?': string
}

export const translations: Translations<Text> = {
  'game.numberlink.delete-puzzle-forever?': {
    en: 'Delete puzzle forever?',
    es: '¿Eliminar rompecabezas para siempre?',
    fr: 'Supprimer le puzzle pour toujours?',
    de: 'Möchtest du das Puzzle endgültig löschen?',
    it: 'Elimina il puzzle per sempre?',
    ja: 'パズルを完全に削除しますか？',
    ko: '퍼즐을 영구적으로 삭제하시겠습니까?',
    pt: 'Excluir quebra-cabeça para sempre?',
    ru: 'Удалить головоломку навсегда?',
    zh: '永久删除拼图？',
    hi: 'क्या आप पहेली को स्थायी रूप से हटाना चाहते हैं?',
    ar: 'هل تريد حذف اللغز نهائياً؟',
  },
  'game.numberlink.puzzle-deleted': {
    en: 'Puzzle deleted',
    es: 'Rompecabezas eliminado',
    fr: 'Puzzle supprimé',
    de: 'Puzzle gelöscht',
    it: 'Puzzle eliminato',
    ja: 'パズルが削除されました',
    ko: '퍼즐이 삭제되었습니다',
    pt: 'Quebra-cabeça excluído',
    ru: 'Головоломка удалена',
    zh: '拼图已删除',
    hi: 'पहेली हटा दी गई',
    ar: 'تم حذف اللغز',
  },
}
