import type { Translations } from '@/l18n'

export type Text = {
  'spaces.current-user-joined-space': string
  'spaces.other-user-joined-space': (username: string | null) => string
  'spaces.space-not-found': string
  'spaces.go-home': string
  'spaces.current-user-ended-space': string
  'spaces.other-user-ended-space': (username: string | null) => string
  'spaces.games': string
  'spaces.current-space': (input: { hostUsername: string }) => string
  'spaces.people-count': (peopleCount: number) => string
  'spaces.home': string
}

export const translations: Translations<Text> = {
  en: {
    'spaces.current-user-joined-space': 'Joined space',
    'spaces.other-user-joined-space': (username) => (username ? `${username} joined space` : 'Joined space'),
    'spaces.space-not-found': 'Space not found',
    'spaces.go-home': 'Go home',
    'spaces.current-user-ended-space': 'Ended space',
    'spaces.other-user-ended-space': (username) => (username ? `${username} ended space` : 'Ended space'),
    'spaces.games': 'Games',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername}'s space`,
    'spaces.home': 'Home',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? 'People' : `People (${peopleCount.toLocaleString()})`)
  },
  es: {
    'spaces.current-user-joined-space': 'Espacio unido',
    'spaces.other-user-joined-space': (username) => (username ? `${username} unido al espacio` : 'Espacio unido'),
    'spaces.space-not-found': 'Espacio no encontrado',
    'spaces.go-home': 'Ir a casa',
    'spaces.current-user-ended-space': 'Espacio terminado',
    'spaces.other-user-ended-space': (username) => (username ? `${username} terminó el espacio` : 'Espacio terminado'),
    'spaces.games': 'Juegos',
    'spaces.current-space': ({ hostUsername }) => `Espacio actual de ${hostUsername}`,
    'spaces.home': 'Inicio',
    'spaces.people-count': (peopleCount) =>
      peopleCount === 1 ? 'Persona' : `Personas (${peopleCount.toLocaleString()})`
  },
  de: {
    'spaces.current-user-joined-space': 'Raum beigetreten',
    'spaces.other-user-joined-space': (username) =>
      username ? `${username} ist dem Raum beigetreten` : 'Raum beigetreten',
    'spaces.space-not-found': 'Raum nicht gefunden',
    'spaces.go-home': 'Nach Hause gehen',
    'spaces.current-user-ended-space': 'Raum beendet',
    'spaces.other-user-ended-space': (username) => (username ? `${username} hat den Raum beendet` : 'Raum beendet'),
    'spaces.games': 'Spiele',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername}s Raum`,
    'spaces.home': 'Startseite',
    'spaces.people-count': (peopleCount) =>
      peopleCount === 1 ? 'Person' : `Personen (${peopleCount.toLocaleString()})`
  },
  fr: {
    'spaces.current-user-joined-space': 'Espace rejoint',
    'spaces.other-user-joined-space': (username) => (username ? `${username} a rejoint l'espace` : 'Espace rejoint'),
    'spaces.space-not-found': 'Espace non trouvé',
    'spaces.go-home': 'Rentrer à la maison',
    'spaces.current-user-ended-space': 'Espace terminé',
    'spaces.other-user-ended-space': (username) => (username ? `${username} a terminé l'espace` : 'Espace terminé'),
    'spaces.games': 'Jeux',
    'spaces.current-space': ({ hostUsername }) => `Espace actuel de ${hostUsername}`,
    'spaces.home': 'Accueil',
    'spaces.people-count': (peopleCount) =>
      peopleCount === 1 ? 'Personne' : `Personnes (${peopleCount.toLocaleString()})`
  },
  it: {
    'spaces.current-user-joined-space': 'Spazio unito',
    'spaces.other-user-joined-space': (username) => (username ? `${username} unito allo spazio` : 'Spazio unito'),
    'spaces.space-not-found': 'Spazio non trovato',
    'spaces.go-home': 'Torna a casa',
    'spaces.current-user-ended-space': 'Spazio terminato',
    'spaces.other-user-ended-space': (username) =>
      username ? `${username} ha terminato lo spazio` : 'Spazio terminato',
    'spaces.games': 'Giochi',
    'spaces.current-space': ({ hostUsername }) => `Spazio attuale di ${hostUsername}`,
    'spaces.home': 'Home',
    'spaces.people-count': (peopleCount) =>
      peopleCount === 1 ? 'Persone' : `Persone (${peopleCount.toLocaleString()})`
  },
  ja: {
    'spaces.current-user-joined-space': 'スペースに参加しました',
    'spaces.other-user-joined-space': (username) =>
      username ? `${username}がスペースに参加しました` : 'スペースに参加しました',
    'spaces.space-not-found': 'スペースが見つかりません',
    'spaces.go-home': '家に帰る',
    'spaces.current-user-ended-space': 'スペース終了',
    'spaces.other-user-ended-space': (username) => (username ? `${username}がスペースを終了しました` : 'スペース終了'),
    'spaces.games': 'ゲーム',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername} のスペース`,
    'spaces.home': 'ホーム',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? '人' : `人 (${peopleCount.toLocaleString()})`)
  },
  ko: {
    'spaces.current-user-joined-space': '공간에 참여했습니다',
    'spaces.other-user-joined-space': (username) =>
      username ? `${username}가 공간에 참여했습니다` : '공간에 참여했습니다',
    'spaces.space-not-found': '공간을 찾을 수 없습니다',
    'spaces.go-home': '집으로 가기',
    'spaces.current-user-ended-space': '공간 종료',
    'spaces.other-user-ended-space': (username) => (username ? `${username}가 공간을 종료했습니다` : '공간 종료'),
    'spaces.games': '게임',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername}의 공간`,
    'spaces.home': '홈',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? '사람' : `사람들 (${peopleCount.toLocaleString()})`)
  },
  pt: {
    'spaces.current-user-joined-space': 'Espaço unido',
    'spaces.other-user-joined-space': (username) => (username ? `${username} unido ao espaço` : 'Espaço unido'),
    'spaces.space-not-found': 'Espaço não encontrado',
    'spaces.go-home': 'Ir para casa',
    'spaces.current-user-ended-space': 'Espaço terminado',
    'spaces.other-user-ended-space': (username) => (username ? `${username} terminou o espaço` : 'Espaço terminado'),
    'spaces.games': 'Jogos',
    'spaces.current-space': ({ hostUsername }) => `Espaço atual de ${hostUsername}`,
    'spaces.home': 'Início',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? 'Pessoa' : `Pessoas (${peopleCount.toLocaleString()})`)
  },
  ru: {
    'spaces.current-user-joined-space': 'Присоединился к пространству',
    'spaces.other-user-joined-space': (username) =>
      username ? `${username} присоединился к пространству` : 'Присоединился к пространству',
    'spaces.space-not-found': 'Пространство не найдено',
    'spaces.go-home': 'Иди домой',
    'spaces.current-user-ended-space': 'Пространство закончено',
    'spaces.other-user-ended-space': (username) =>
      username ? `${username} закончил пространство` : 'Пространство закончено',
    'spaces.games': 'игры',
    'spaces.current-space': ({ hostUsername }) => `Текущее пространство ${hostUsername}`,
    'spaces.home': 'Главная',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? 'Люди' : `Люди (${peopleCount.toLocaleString()})`)
  },
  zh: {
    'spaces.current-user-joined-space': '加入空间',
    'spaces.other-user-joined-space': (username) => (username ? `${username}加入空间` : '加入空间'),
    'spaces.space-not-found': '找不到空间',
    'spaces.go-home': '回家',
    'spaces.current-user-ended-space': '结束空间',
    'spaces.other-user-ended-space': (username) => (username ? `${username}结束空间` : '结束空间'),
    'spaces.games': '游戏',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername} 的空间`,
    'spaces.home': '主页',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? '人' : `人 (${peopleCount.toLocaleString()})`)
  },
  hi: {
    'spaces.current-user-joined-space': 'स्थान जुड़ गया',
    'spaces.other-user-joined-space': (username) => (username ? `${username} स्थान जुड़ गया` : 'स्थान जुड़ गया'),
    'spaces.space-not-found': 'स्थान नहीं मिला',
    'spaces.go-home': 'घर जा',
    'spaces.current-user-ended-space': 'स्थान समाप्त',
    'spaces.other-user-ended-space': (username) => (username ? `${username} स्थान समाप्त` : 'स्थान समाप्त'),
    'spaces.games': 'खेल',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername} का स्थान`,
    'spaces.home': 'होम',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? 'लोग' : `लोग (${peopleCount.toLocaleString()})`)
  },
  ar: {
    'spaces.current-user-joined-space': 'انضم إلى الفضاء',
    'spaces.other-user-joined-space': (username) => (username ? `${username} انضم إلى الفضاء` : 'انضم إلى الفضاء'),
    'spaces.space-not-found': 'الفضاء غير موجود',
    'spaces.go-home': 'اذهب إلى الصفحة الرئيسية',
    'spaces.current-user-ended-space': 'انتهى الفضاء',
    'spaces.other-user-ended-space': (username) => (username ? `${username} انتهى الفضاء` : 'انتهى الفضاء'),
    'spaces.games': 'الألعاب',
    'spaces.current-space': ({ hostUsername }) => `المساحة الحالية لـ ${hostUsername}`,
    'spaces.home': 'الصفحة الرئيسية',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? 'الناس' : `الناس (${peopleCount.toLocaleString()})`)
  }
}
