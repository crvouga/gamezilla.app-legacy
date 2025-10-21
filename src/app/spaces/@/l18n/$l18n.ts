import type { Translations } from '~/@/l18n'

export type Text = {
  'spaces.current-userJoinedSpace': string
  'spaces.other-userJoinedSpace': (username: string | null) => string
  'spaces.space-not-found': string
  'spaces.exit-space': string
  'spaces.current-userEndedSpace': string
  'spaces.other-userEndedSpace': (username: string | null) => string
  'spaces.games': string
  'spaces.current-space': (input: { hostUsername: string }) => string
  'spaces.people-count': (peopleCount: number) => string
  'spaces.home': string
}

export const translations: Translations<Text> = {
  en: {
    'spaces.current-userJoinedSpace': 'Joined space',
    'spaces.other-userJoinedSpace': (username) => (username ? `${username} joined space` : 'Joined space'),
    'spaces.space-not-found': 'Space not found',
    'spaces.exit-space': 'Go home',
    'spaces.current-userEndedSpace': 'Ended space',
    'spaces.other-userEndedSpace': (username) => (username ? `${username} ended space` : 'Ended space'),
    'spaces.games': 'Games',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername}'s space`,
    'spaces.home': 'Home',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? 'People' : `People (${peopleCount.toLocaleString()})`),
  },
  es: {
    'spaces.current-userJoinedSpace': 'Espacio unido',
    'spaces.other-userJoinedSpace': (username) => (username ? `${username} unido al espacio` : 'Espacio unido'),
    'spaces.space-not-found': 'Espacio no encontrado',
    'spaces.exit-space': 'Ir a casa',
    'spaces.current-userEndedSpace': 'Espacio terminado',
    'spaces.other-userEndedSpace': (username) => (username ? `${username} terminó el espacio` : 'Espacio terminado'),
    'spaces.games': 'Juegos',
    'spaces.current-space': ({ hostUsername }) => `Espacio actual de ${hostUsername}`,
    'spaces.home': 'Inicio',
    'spaces.people-count': (peopleCount) =>
      peopleCount === 1 ? 'Persona' : `Personas (${peopleCount.toLocaleString()})`,
  },
  de: {
    'spaces.current-userJoinedSpace': 'Raum beigetreten',
    'spaces.other-userJoinedSpace': (username) =>
      username ? `${username} ist dem Raum beigetreten` : 'Raum beigetreten',
    'spaces.space-not-found': 'Raum nicht gefunden',
    'spaces.exit-space': 'Nach Hause gehen',
    'spaces.current-userEndedSpace': 'Raum beendet',
    'spaces.other-userEndedSpace': (username) => (username ? `${username} hat den Raum beendet` : 'Raum beendet'),
    'spaces.games': 'Spiele',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername}s Raum`,
    'spaces.home': 'Startseite',
    'spaces.people-count': (peopleCount) =>
      peopleCount === 1 ? 'Person' : `Personen (${peopleCount.toLocaleString()})`,
  },
  fr: {
    'spaces.current-userJoinedSpace': 'Espace rejoint',
    'spaces.other-userJoinedSpace': (username) => (username ? `${username} a rejoint l'espace` : 'Espace rejoint'),
    'spaces.space-not-found': 'Espace non trouvé',
    'spaces.exit-space': 'Rentrer à la maison',
    'spaces.current-userEndedSpace': 'Espace terminé',
    'spaces.other-userEndedSpace': (username) => (username ? `${username} a terminé l'espace` : 'Espace terminé'),
    'spaces.games': 'Jeux',
    'spaces.current-space': ({ hostUsername }) => `Espace actuel de ${hostUsername}`,
    'spaces.home': 'Accueil',
    'spaces.people-count': (peopleCount) =>
      peopleCount === 1 ? 'Personne' : `Personnes (${peopleCount.toLocaleString()})`,
  },
  it: {
    'spaces.current-userJoinedSpace': 'Spazio unito',
    'spaces.other-userJoinedSpace': (username) => (username ? `${username} unito allo spazio` : 'Spazio unito'),
    'spaces.space-not-found': 'Spazio non trovato',
    'spaces.exit-space': 'Torna a casa',
    'spaces.current-userEndedSpace': 'Spazio terminato',
    'spaces.other-userEndedSpace': (username) => (username ? `${username} ha terminato lo spazio` : 'Spazio terminato'),
    'spaces.games': 'Giochi',
    'spaces.current-space': ({ hostUsername }) => `Spazio attuale di ${hostUsername}`,
    'spaces.home': 'Home',
    'spaces.people-count': (peopleCount) =>
      peopleCount === 1 ? 'Persone' : `Persone (${peopleCount.toLocaleString()})`,
  },
  ja: {
    'spaces.current-userJoinedSpace': 'スペースに参加しました',
    'spaces.other-userJoinedSpace': (username) =>
      username ? `${username}がスペースに参加しました` : 'スペースに参加しました',
    'spaces.space-not-found': 'スペースが見つかりません',
    'spaces.exit-space': '家に帰る',
    'spaces.current-userEndedSpace': 'スペース終了',
    'spaces.other-userEndedSpace': (username) => (username ? `${username}がスペースを終了しました` : 'スペース終了'),
    'spaces.games': 'ゲーム',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername} のスペース`,
    'spaces.home': 'ホーム',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? '人' : `人 (${peopleCount.toLocaleString()})`),
  },
  ko: {
    'spaces.current-userJoinedSpace': '공간에 참여했습니다',
    'spaces.other-userJoinedSpace': (username) =>
      username ? `${username}가 공간에 참여했습니다` : '공간에 참여했습니다',
    'spaces.space-not-found': '공간을 찾을 수 없습니다',
    'spaces.exit-space': '집으로 가기',
    'spaces.current-userEndedSpace': '공간 종료',
    'spaces.other-userEndedSpace': (username) => (username ? `${username}가 공간을 종료했습니다` : '공간 종료'),
    'spaces.games': '게임',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername}의 공간`,
    'spaces.home': '홈',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? '사람' : `사람들 (${peopleCount.toLocaleString()})`),
  },
  pt: {
    'spaces.current-userJoinedSpace': 'Espaço unido',
    'spaces.other-userJoinedSpace': (username) => (username ? `${username} unido ao espaço` : 'Espaço unido'),
    'spaces.space-not-found': 'Espaço não encontrado',
    'spaces.exit-space': 'Ir para casa',
    'spaces.current-userEndedSpace': 'Espaço terminado',
    'spaces.other-userEndedSpace': (username) => (username ? `${username} terminou o espaço` : 'Espaço terminado'),
    'spaces.games': 'Jogos',
    'spaces.current-space': ({ hostUsername }) => `Espaço atual de ${hostUsername}`,
    'spaces.home': 'Início',
    'spaces.people-count': (peopleCount) =>
      peopleCount === 1 ? 'Pessoa' : `Pessoas (${peopleCount.toLocaleString()})`,
  },
  ru: {
    'spaces.current-userJoinedSpace': 'Присоединился к пространству',
    'spaces.other-userJoinedSpace': (username) =>
      username ? `${username} присоединился к пространству` : 'Присоединился к пространству',
    'spaces.space-not-found': 'Пространство не найдено',
    'spaces.exit-space': 'Иди домой',
    'spaces.current-userEndedSpace': 'Пространство закончено',
    'spaces.other-userEndedSpace': (username) =>
      username ? `${username} закончил пространство` : 'Пространство закончено',
    'spaces.games': 'игры',
    'spaces.current-space': ({ hostUsername }) => `Текущее пространство ${hostUsername}`,
    'spaces.home': 'Главная',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? 'Люди' : `Люди (${peopleCount.toLocaleString()})`),
  },
  zh: {
    'spaces.current-userJoinedSpace': '加入空间',
    'spaces.other-userJoinedSpace': (username) => (username ? `${username}加入空间` : '加入空间'),
    'spaces.space-not-found': '找不到空间',
    'spaces.exit-space': '回家',
    'spaces.current-userEndedSpace': '结束空间',
    'spaces.other-userEndedSpace': (username) => (username ? `${username}结束空间` : '结束空间'),
    'spaces.games': '游戏',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername} 的空间`,
    'spaces.home': '主页',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? '人' : `人 (${peopleCount.toLocaleString()})`),
  },
  hi: {
    'spaces.current-userJoinedSpace': 'स्थान जुड़ गया',
    'spaces.other-userJoinedSpace': (username) => (username ? `${username} स्थान जुड़ गया` : 'स्थान जुड़ गया'),
    'spaces.space-not-found': 'स्थान नहीं मिला',
    'spaces.exit-space': 'घर जा',
    'spaces.current-userEndedSpace': 'स्थान समाप्त',
    'spaces.other-userEndedSpace': (username) => (username ? `${username} स्थान समाप्त` : 'स्थान समाप्त'),
    'spaces.games': 'खेल',
    'spaces.current-space': ({ hostUsername }) => `${hostUsername} का स्थान`,
    'spaces.home': 'होम',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? 'लोग' : `लोग (${peopleCount.toLocaleString()})`),
  },
  ar: {
    'spaces.current-userJoinedSpace': 'انضم إلى الفضاء',
    'spaces.other-userJoinedSpace': (username) => (username ? `${username} انضم إلى الفضاء` : 'انضم إلى الفضاء'),
    'spaces.space-not-found': 'الفضاء غير موجود',
    'spaces.exit-space': 'اذهب إلى الصفحة الرئيسية',
    'spaces.current-userEndedSpace': 'انتهى الفضاء',
    'spaces.other-userEndedSpace': (username) => (username ? `${username} انتهى الفضاء` : 'انتهى الفضاء'),
    'spaces.games': 'الألعاب',
    'spaces.current-space': ({ hostUsername }) => `المساحة الحالية لـ ${hostUsername}`,
    'spaces.home': 'الصفحة الرئيسية',
    'spaces.people-count': (peopleCount) => (peopleCount === 1 ? 'الناس' : `الناس (${peopleCount.toLocaleString()})`),
  },
}
