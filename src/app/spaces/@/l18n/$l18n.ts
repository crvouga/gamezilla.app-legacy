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
  'spaces.current-space': {
    en: ({ hostUsername }) => `${hostUsername}'s space`,
    es: ({ hostUsername }) => `Espacio actual de ${hostUsername}`,
    fr: ({ hostUsername }) => `Espace actuel de ${hostUsername}`,
    de: ({ hostUsername }) => `${hostUsername}s Raum`,
    it: ({ hostUsername }) => `Spazio attuale di ${hostUsername}`,
    ja: ({ hostUsername }) => `${hostUsername} \u306E\u30B9\u30DA\u30FC\u30B9`,
    ko: ({ hostUsername }) => `${hostUsername}\uC758 \uACF5\uAC04`,
    pt: ({ hostUsername }) => `Espa\xE7o atual de ${hostUsername}`,
    ru: ({ hostUsername }) =>
      `\u0422\u0435\u043A\u0443\u0449\u0435\u0435 \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E ${hostUsername}`,
    zh: ({ hostUsername }) => `${hostUsername} \u7684\u7A7A\u95F4`,
    hi: ({ hostUsername }) => `${hostUsername} \u0915\u093E \u0938\u094D\u0925\u093E\u0928`,
    ar: ({ hostUsername }) =>
      `\u0627\u0644\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 \u0644\u0640 ${hostUsername}`,
  },
  'spaces.current-userEndedSpace': {
    en: 'Ended space',
    es: 'Espacio terminado',
    fr: 'Espace terminé',
    de: 'Raum beendet',
    it: 'Spazio terminato',
    ja: 'スペース終了',
    ko: '공간 종료',
    pt: 'Espaço terminado',
    ru: 'Пространство закончено',
    zh: '结束空间',
    hi: 'स्थान समाप्त',
    ar: 'انتهى الفضاء',
  },
  'spaces.current-userJoinedSpace': {
    en: 'Joined space',
    es: 'Espacio unido',
    fr: 'Espace rejoint',
    de: 'Raum beigetreten',
    it: 'Spazio unito',
    ja: 'スペースに参加しました',
    ko: '공간에 참여했습니다',
    pt: 'Espaço unido',
    ru: 'Присоединился к пространству',
    zh: '加入空间',
    hi: 'स्थान जुड़ गया',
    ar: 'انضم إلى الفضاء',
  },
  'spaces.exit-space': {
    en: 'Go home',
    es: 'Ir a casa',
    fr: 'Rentrer à la maison',
    de: 'Nach Hause gehen',
    it: 'Torna a casa',
    ja: '家に帰る',
    ko: '집으로 가기',
    pt: 'Ir para casa',
    ru: 'Иди домой',
    zh: '回家',
    hi: 'घर जा',
    ar: 'اذهب إلى الصفحة الرئيسية',
  },
  'spaces.games': {
    en: 'Games',
    es: 'Juegos',
    fr: 'Jeux',
    de: 'Spiele',
    it: 'Giochi',
    ja: 'ゲーム',
    ko: '게임',
    pt: 'Jogos',
    ru: 'игры',
    zh: '游戏',
    hi: 'खेल',
    ar: 'الألعاب',
  },
  'spaces.home': {
    en: 'Home',
    es: 'Inicio',
    fr: 'Accueil',
    de: 'Startseite',
    it: 'Home',
    ja: 'ホーム',
    ko: '홈',
    pt: 'Início',
    ru: 'Главная',
    zh: '主页',
    hi: 'होम',
    ar: 'الصفحة الرئيسية',
  },
  'spaces.other-userEndedSpace': {
    en: (username) => (username ? `${username} ended space` : 'Ended space'),
    es: (username) => (username ? `${username} termin\xF3 el espacio` : 'Espacio terminado'),
    fr: (username) => (username ? `${username} a termin\xE9 l'espace` : 'Espace termin\xE9'),
    de: (username) => (username ? `${username} hat den Raum beendet` : 'Raum beendet'),
    it: (username) => (username ? `${username} ha terminato lo spazio` : 'Spazio terminato'),
    ja: (username) =>
      username
        ? `${username}\u304C\u30B9\u30DA\u30FC\u30B9\u3092\u7D42\u4E86\u3057\u307E\u3057\u305F`
        : '\u30B9\u30DA\u30FC\u30B9\u7D42\u4E86',
    ko: (username) =>
      username
        ? `${username}\uAC00 \uACF5\uAC04\uC744 \uC885\uB8CC\uD588\uC2B5\uB2C8\uB2E4`
        : '\uACF5\uAC04 \uC885\uB8CC',
    pt: (username) => (username ? `${username} terminou o espa\xE7o` : 'Espa\xE7o terminado'),
    ru: (username) =>
      username
        ? `${username} \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E`
        : '\u041F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E \u0437\u0430\u043A\u043E\u043D\u0447\u0435\u043D\u043E',
    zh: (username) => (username ? `${username}\u7ED3\u675F\u7A7A\u95F4` : '\u7ED3\u675F\u7A7A\u95F4'),
    hi: (username) =>
      username
        ? `${username} \u0938\u094D\u0925\u093E\u0928 \u0938\u092E\u093E\u092A\u094D\u0924`
        : '\u0938\u094D\u0925\u093E\u0928 \u0938\u092E\u093E\u092A\u094D\u0924',
    ar: (username) =>
      username
        ? `${username} \u0627\u0646\u062A\u0647\u0649 \u0627\u0644\u0641\u0636\u0627\u0621`
        : '\u0627\u0646\u062A\u0647\u0649 \u0627\u0644\u0641\u0636\u0627\u0621',
  },
  'spaces.other-userJoinedSpace': {
    en: (username) => (username ? `${username} joined space` : 'Joined space'),
    es: (username) => (username ? `${username} unido al espacio` : 'Espacio unido'),
    fr: (username) => (username ? `${username} a rejoint l'espace` : 'Espace rejoint'),
    de: (username) => (username ? `${username} ist dem Raum beigetreten` : 'Raum beigetreten'),
    it: (username) => (username ? `${username} unito allo spazio` : 'Spazio unito'),
    ja: (username) =>
      username
        ? `${username}\u304C\u30B9\u30DA\u30FC\u30B9\u306B\u53C2\u52A0\u3057\u307E\u3057\u305F`
        : '\u30B9\u30DA\u30FC\u30B9\u306B\u53C2\u52A0\u3057\u307E\u3057\u305F',
    ko: (username) =>
      username
        ? `${username}\uAC00 \uACF5\uAC04\uC5D0 \uCC38\uC5EC\uD588\uC2B5\uB2C8\uB2E4`
        : '\uACF5\uAC04\uC5D0 \uCC38\uC5EC\uD588\uC2B5\uB2C8\uB2E4',
    pt: (username) => (username ? `${username} unido ao espa\xE7o` : 'Espa\xE7o unido'),
    ru: (username) =>
      username
        ? `${username} \u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u043B\u0441\u044F \u043A \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0443`
        : '\u041F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u0438\u043B\u0441\u044F \u043A \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0443',
    zh: (username) => (username ? `${username}\u52A0\u5165\u7A7A\u95F4` : '\u52A0\u5165\u7A7A\u95F4'),
    hi: (username) =>
      username
        ? `${username} \u0938\u094D\u0925\u093E\u0928 \u091C\u0941\u0921\u093C \u0917\u092F\u093E`
        : '\u0938\u094D\u0925\u093E\u0928 \u091C\u0941\u0921\u093C \u0917\u092F\u093E',
    ar: (username) =>
      username
        ? `${username} \u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0627\u0644\u0641\u0636\u0627\u0621`
        : '\u0627\u0646\u0636\u0645 \u0625\u0644\u0649 \u0627\u0644\u0641\u0636\u0627\u0621',
  },
  'spaces.people-count': {
    en: (peopleCount) => (peopleCount === 1 ? 'People' : `People (${peopleCount.toLocaleString()})`),
    es: (peopleCount) => (peopleCount === 1 ? 'Persona' : `Personas (${peopleCount.toLocaleString()})`),
    fr: (peopleCount) => (peopleCount === 1 ? 'Personne' : `Personnes (${peopleCount.toLocaleString()})`),
    de: (peopleCount) => (peopleCount === 1 ? 'Person' : `Personen (${peopleCount.toLocaleString()})`),
    it: (peopleCount) => (peopleCount === 1 ? 'Persone' : `Persone (${peopleCount.toLocaleString()})`),
    ja: (peopleCount) => (peopleCount === 1 ? '\u4EBA' : `\u4EBA (${peopleCount.toLocaleString()})`),
    ko: (peopleCount) => (peopleCount === 1 ? '\uC0AC\uB78C' : `\uC0AC\uB78C\uB4E4 (${peopleCount.toLocaleString()})`),
    pt: (peopleCount) => (peopleCount === 1 ? 'Pessoa' : `Pessoas (${peopleCount.toLocaleString()})`),
    ru: (peopleCount) =>
      peopleCount === 1 ? '\u041B\u044E\u0434\u0438' : `\u041B\u044E\u0434\u0438 (${peopleCount.toLocaleString()})`,
    zh: (peopleCount) => (peopleCount === 1 ? '\u4EBA' : `\u4EBA (${peopleCount.toLocaleString()})`),
    hi: (peopleCount) =>
      peopleCount === 1 ? '\u0932\u094B\u0917' : `\u0932\u094B\u0917 (${peopleCount.toLocaleString()})`,
    ar: (peopleCount) =>
      peopleCount === 1
        ? '\u0627\u0644\u0646\u0627\u0633'
        : `\u0627\u0644\u0646\u0627\u0633 (${peopleCount.toLocaleString()})`,
  },
  'spaces.space-not-found': {
    en: 'Space not found',
    es: 'Espacio no encontrado',
    fr: 'Espace non trouvé',
    de: 'Raum nicht gefunden',
    it: 'Spazio non trovato',
    ja: 'スペースが見つかりません',
    ko: '공간을 찾을 수 없습니다',
    pt: 'Espaço não encontrado',
    ru: 'Пространство не найдено',
    zh: '找不到空间',
    hi: 'स्थान नहीं मिला',
    ar: 'الفضاء غير موجود',
  },
}
