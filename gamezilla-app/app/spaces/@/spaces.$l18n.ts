import type { Translations } from 'gamezilla-app/@/l18n'

export type Text = {
  'spaces.current-user-joined-space': string
  'spaces.other-user-joined-space': (username: string | null) => string
  'spaces.space-not-found': string
  'spaces.go-home': string
  'spaces.current-user-ended-space': string
  'spaces.other-user-ended-space': (username: string | null) => string
}

export const translations: Translations<Text> = {
  en: {
    'spaces.current-user-joined-space': 'Joined space',
    'spaces.other-user-joined-space': (username) => (username ? `${username} joined space` : 'Joined space'),
    'spaces.space-not-found': 'Space not found',
    'spaces.go-home': 'Go home',
    'spaces.current-user-ended-space': 'Ended space',
    'spaces.other-user-ended-space': (username) => (username ? `${username} ended space` : 'Ended space')
  },
  es: {
    'spaces.current-user-joined-space': 'Espacio unido',
    'spaces.other-user-joined-space': (username) => (username ? `${username} unido al espacio` : 'Espacio unido'),
    'spaces.space-not-found': 'Espacio no encontrado',
    'spaces.go-home': 'Ir a casa',
    'spaces.current-user-ended-space': 'Espacio terminado',
    'spaces.other-user-ended-space': (username) => (username ? `${username} terminó el espacio` : 'Espacio terminado')
  },
  de: {
    'spaces.current-user-joined-space': 'Raum beigetreten',
    'spaces.other-user-joined-space': (username) =>
      username ? `${username} ist dem Raum beigetreten` : 'Raum beigetreten',
    'spaces.space-not-found': 'Raum nicht gefunden',
    'spaces.go-home': 'Nach Hause gehen',
    'spaces.current-user-ended-space': 'Raum beendet',
    'spaces.other-user-ended-space': (username) => (username ? `${username} hat den Raum beendet` : 'Raum beendet')
  },
  fr: {
    'spaces.current-user-joined-space': 'Espace rejoint',
    'spaces.other-user-joined-space': (username) => (username ? `${username} a rejoint l'espace` : 'Espace rejoint'),
    'spaces.space-not-found': 'Espace non trouvé',
    'spaces.go-home': 'Rentrer à la maison',
    'spaces.current-user-ended-space': 'Espace terminé',
    'spaces.other-user-ended-space': (username) => (username ? `${username} a terminé l'espace` : 'Espace terminé')
  },
  it: {
    'spaces.current-user-joined-space': 'Spazio unito',
    'spaces.other-user-joined-space': (username) => (username ? `${username} unito allo spazio` : 'Spazio unito'),
    'spaces.space-not-found': 'Spazio non trovato',
    'spaces.go-home': 'Torna a casa',
    'spaces.current-user-ended-space': 'Spazio terminato',
    'spaces.other-user-ended-space': (username) =>
      username ? `${username} ha terminato lo spazio` : 'Spazio terminato'
  },
  ja: {
    'spaces.current-user-joined-space': 'スペースに参加しました',
    'spaces.other-user-joined-space': (username) =>
      username ? `${username}がスペースに参加しました` : 'スペースに参加しました',
    'spaces.space-not-found': 'スペースが見つかりません',
    'spaces.go-home': '家に帰る',
    'spaces.current-user-ended-space': 'スペース終了',
    'spaces.other-user-ended-space': (username) => (username ? `${username}がスペースを終了しました` : 'スペース終了')
  },
  ko: {
    'spaces.current-user-joined-space': '공간에 참여했습니다',
    'spaces.other-user-joined-space': (username) =>
      username ? `${username}가 공간에 참여했습니다` : '공간에 참여했습니다',
    'spaces.space-not-found': '공간을 찾을 수 없습니다',
    'spaces.go-home': '집으로 가기',
    'spaces.current-user-ended-space': '공간 종료',
    'spaces.other-user-ended-space': (username) => (username ? `${username}가 공간을 종료했습니다` : '공간 종료')
  },
  pt: {
    'spaces.current-user-joined-space': 'Espaço unido',
    'spaces.other-user-joined-space': (username) => (username ? `${username} unido ao espaço` : 'Espaço unido'),
    'spaces.space-not-found': 'Espaço não encontrado',
    'spaces.go-home': 'Ir para casa',
    'spaces.current-user-ended-space': 'Espaço terminado',
    'spaces.other-user-ended-space': (username) => (username ? `${username} terminou o espaço` : 'Espaço terminado')
  },
  ru: {
    'spaces.current-user-joined-space': 'Присоединился к пространству',
    'spaces.other-user-joined-space': (username) =>
      username ? `${username} присоединился к пространству` : 'Присоединился к пространству',
    'spaces.space-not-found': 'Пространство не найдено',
    'spaces.go-home': 'Иди домой',
    'spaces.current-user-ended-space': 'Пространство закончено',
    'spaces.other-user-ended-space': (username) =>
      username ? `${username} закончил пространство` : 'Пространство закончено'
  },
  zh: {
    'spaces.current-user-joined-space': '加入空间',
    'spaces.other-user-joined-space': (username) => (username ? `${username}加入空间` : '加入空间'),
    'spaces.space-not-found': '找不到空间',
    'spaces.go-home': '回家',
    'spaces.current-user-ended-space': '结束空间',
    'spaces.other-user-ended-space': (username) => (username ? `${username}结束空间` : '结束空间')
  },
  hi: {
    'spaces.current-user-joined-space': 'स्थान जुड़ गया',
    'spaces.other-user-joined-space': (username) => (username ? `${username} स्थान जुड़ गया` : 'स्थान जुड़ गया'),
    'spaces.space-not-found': 'स्थान नहीं मिला',
    'spaces.go-home': 'घर जा',
    'spaces.current-user-ended-space': 'स्थान समाप्त',
    'spaces.other-user-ended-space': (username) => (username ? `${username} स्थान समाप्त` : 'स्थान समाप्त')
  },
  ar: {
    'spaces.current-user-joined-space': 'انضم إلى الفضاء',
    'spaces.other-user-joined-space': (username) => (username ? `${username} انضم إلى الفضاء` : 'انضم إلى الفضاء'),
    'spaces.space-not-found': 'الفضاء غير موجود',
    'spaces.go-home': 'اذهب إلى الصفحة الرئيسية',
    'spaces.current-user-ended-space': 'انتهى الفضاء',
    'spaces.other-user-ended-space': (username) => (username ? `${username} انتهى الفضاء` : 'انتهى الفضاء')
  }
}
