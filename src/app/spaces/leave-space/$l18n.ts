import type { Translations } from '~/@/l18n'
import { Username } from '~/app/@/data/username'

export type Text = {
  'spaces.current-user-left': string
  'spaces.other-user-left': (username: Username) => string
  'spaces.leave': string
}

export const translations: Translations<Text> = {
  en: {
    'spaces.current-user-left': 'Left space',
    'spaces.other-user-left': (username) => `${username} left space`,
    'spaces.leave': 'Leave'
  },
  de: {
    'spaces.current-user-left': 'Raum verlassen',
    'spaces.other-user-left': (username) => `${username} hat den Raum verlassen`,
    'spaces.leave': 'Verlassen'
  },
  es: {
    'spaces.current-user-left': 'Dejó el espacio',
    'spaces.other-user-left': (username) => `${username} dejó el espacio`,
    'spaces.leave': 'Dejar'
  },
  fr: {
    'spaces.current-user-left': "A quitté l'espace",
    'spaces.other-user-left': (username) => `${username} a quitté l'espace`,
    'spaces.leave': 'Quitter'
  },
  hi: {
    'spaces.current-user-left': 'अंतरिक्ष छोड़ दिया',
    'spaces.other-user-left': (username) => `${username} अंतरिक्ष छोड़ गया`,
    'spaces.leave': 'छोड़ना'
  },
  it: {
    'spaces.current-user-left': 'Ha lasciato lo spazio',
    'spaces.other-user-left': (username) => `${username} ha lasciato lo spazio`,
    'spaces.leave': 'Lasciare'
  },
  ja: {
    'spaces.current-user-left': 'スペースを離れました',
    'spaces.other-user-left': (username) => `${username} がスペースを離れました`,
    'spaces.leave': '去る'
  },
  ar: {
    'spaces.current-user-left': 'ترك الفضاء',
    'spaces.other-user-left': (username) => `${username} ترك الفضاء`,
    'spaces.leave': 'غادر'
  },
  ko: {
    'spaces.current-user-left': '공간을 나갔습니다',
    'spaces.other-user-left': (username) => `${username}가 공간을 나갔습니다`,
    'spaces.leave': '나가기'
  },
  pt: {
    'spaces.current-user-left': 'Deixou o espaço',
    'spaces.other-user-left': (username) => `${username} deixou o espaço`,
    'spaces.leave': 'Sair'
  },
  ru: {
    'spaces.current-user-left': 'Покинул пространство',
    'spaces.other-user-left': (username) => `${username} покинул пространство`,
    'spaces.leave': 'Покинуть'
  },
  zh: {
    'spaces.current-user-left': '离开空间',
    'spaces.other-user-left': (username) => `${username} 离开了空间`,
    'spaces.leave': '离开'
  }
}
