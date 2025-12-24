import type { Translations } from '~/@/l18n'
import { Username } from '~/app/@/data/username'

export type Text = {
  'spaces.current-user-left': string
  'spaces.other-user-left': (username: Username) => string
  'spaces.leave': string
}

export const translations: Translations<Text> = {
  'spaces.current-user-left': {
    en: 'Left space',
    es: 'Dejó el espacio',
    fr: "A quitté l'espace",
    de: 'Raum verlassen',
    it: 'Ha lasciato lo spazio',
    ja: 'スペースを離れました',
    ko: '공간을 나갔습니다',
    pt: 'Deixou o espaço',
    ru: 'Покинул пространство',
    zh: '离开空间',
    hi: 'अंतरिक्ष छोड़ दिया',
    ar: 'ترك الفضاء',
  },
  'spaces.leave': {
    en: 'Leave',
    es: 'Dejar',
    fr: 'Quitter',
    de: 'Verlassen',
    it: 'Lasciare',
    ja: '去る',
    ko: '나가기',
    pt: 'Sair',
    ru: 'Покинуть',
    zh: '离开',
    hi: 'छोड़ना',
    ar: 'غادر',
  },
  'spaces.other-user-left': {
    en: (username) => `${username} left space`,
    es: (username) => `${username} dej\xF3 el espacio`,
    fr: (username) => `${username} a quitt\xE9 l'espace`,
    de: (username) => `${username} hat den Raum verlassen`,
    it: (username) => `${username} ha lasciato lo spazio`,
    ja: (username) => `${username} \u304C\u30B9\u30DA\u30FC\u30B9\u3092\u96E2\u308C\u307E\u3057\u305F`,
    ko: (username) => `${username}\uAC00 \uACF5\uAC04\uC744 \uB098\uAC14\uC2B5\uB2C8\uB2E4`,
    pt: (username) => `${username} deixou o espa\xE7o`,
    ru: (username) =>
      `${username} \u043F\u043E\u043A\u0438\u043D\u0443\u043B \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u043E`,
    zh: (username) => `${username} \u79BB\u5F00\u4E86\u7A7A\u95F4`,
    hi: (username) =>
      `${username} \u0905\u0902\u0924\u0930\u093F\u0915\u094D\u0937 \u091B\u094B\u0921\u093C \u0917\u092F\u093E`,
    ar: (username) => `${username} \u062A\u0631\u0643 \u0627\u0644\u0641\u0636\u0627\u0621`,
  },
}
