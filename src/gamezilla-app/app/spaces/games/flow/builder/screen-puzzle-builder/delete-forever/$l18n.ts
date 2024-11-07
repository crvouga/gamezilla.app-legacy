import type { Translations } from '@/l18n'

export type Text = {
  'flow.puzzle-deleted': string
  'flow.delete-puzzle-forever?': string
  'flow.delete-forever': string
}

export const translations: Translations<Text> = {
  ar: {
    'flow.puzzle-deleted': 'تم حذف اللغز',
    'flow.delete-puzzle-forever?': 'هل تريد حذف اللغز نهائياً؟',
    'flow.delete-forever': 'حذف نهائي'
  },
  de: {
    'flow.puzzle-deleted': 'Puzzle gelöscht',
    'flow.delete-puzzle-forever?': 'Möchtest du das Puzzle endgültig löschen?',
    'flow.delete-forever': 'Endgültig löschen'
  },
  en: {
    'flow.puzzle-deleted': 'Puzzle deleted',
    'flow.delete-puzzle-forever?': 'Delete puzzle forever?',
    'flow.delete-forever': 'Delete forever'
  },
  es: {
    'flow.puzzle-deleted': 'Rompecabezas eliminado',
    'flow.delete-puzzle-forever?': '¿Eliminar rompecabezas para siempre?',
    'flow.delete-forever': 'Eliminar para siempre'
  },
  fr: {
    'flow.puzzle-deleted': 'Puzzle supprimé',
    'flow.delete-puzzle-forever?': 'Supprimer le puzzle pour toujours?',
    'flow.delete-forever': 'Supprimer pour toujours'
  },
  hi: {
    'flow.puzzle-deleted': 'पहेली हटा दी गई',
    'flow.delete-puzzle-forever?': 'क्या आप पहेली को स्थायी रूप से हटाना चाहते हैं?',
    'flow.delete-forever': 'स्थायी रूप से हटाएं'
  },
  it: {
    'flow.puzzle-deleted': 'Puzzle eliminato',
    'flow.delete-puzzle-forever?': 'Elimina il puzzle per sempre?',
    'flow.delete-forever': 'Elimina per sempre'
  },
  ja: {
    'flow.puzzle-deleted': 'パズルが削除されました',
    'flow.delete-puzzle-forever?': 'パズルを完全に削除しますか？',
    'flow.delete-forever': '完全に削除'
  },
  ko: {
    'flow.puzzle-deleted': '퍼즐이 삭제되었습니다',
    'flow.delete-puzzle-forever?': '퍼즐을 영구적으로 삭제하시겠습니까?',
    'flow.delete-forever': '영구적으로 삭제'
  },
  pt: {
    'flow.puzzle-deleted': 'Quebra-cabeça excluído',
    'flow.delete-puzzle-forever?': 'Excluir quebra-cabeça para sempre?',
    'flow.delete-forever': 'Excluir para sempre'
  },
  ru: {
    'flow.puzzle-deleted': 'Головоломка удалена',
    'flow.delete-puzzle-forever?': 'Удалить головоломку навсегда?',
    'flow.delete-forever': 'Удалить навсегда'
  },
  zh: {
    'flow.puzzle-deleted': '拼图已删除',
    'flow.delete-puzzle-forever?': '永久删除拼图？',
    'flow.delete-forever': '永久删除'
  }
}
