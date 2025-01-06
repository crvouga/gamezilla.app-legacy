import type { Translations } from '~/@/l18n'
import { Username } from '~/app/@/data/username'

export type Text = {
  'spaces.join-space': string
  'spaces.current-user-joined-space': string
  'spaces.other-user-joined-space': (username: Username) => string
  "spaces.you're-already-in-a-space": string
  'spaces.space': string
}

export const translations: Translations<Text> = {
  ar: {
    'spaces.space': 'الفضاء',
    'spaces.join-space': 'انضم إلى المساحة',
    'spaces.current-user-joined-space': 'انضمت إلى المساحة',
    'spaces.other-user-joined-space': (username) => `${username} انضم إلى المساحة`,
    "spaces.you're-already-in-a-space": 'أنت بالفعل في مساحة',
  },
  de: {
    'spaces.space': 'Raum',
    'spaces.join-space': 'Raum beitreten',
    'spaces.current-user-joined-space': 'Raum beigetreten',
    'spaces.other-user-joined-space': (username) => `${username} ist dem Raum beigetreten`,
    "spaces.you're-already-in-a-space": 'Du bist bereits in einem Raum',
  },
  en: {
    'spaces.space': 'Space',
    'spaces.join-space': 'Join space',
    'spaces.current-user-joined-space': 'Joined space',
    'spaces.other-user-joined-space': (username) => `${username} joined space`,
    "spaces.you're-already-in-a-space": "You're already in a space",
  },
  es: {
    'spaces.space': 'Espacio',
    'spaces.join-space': 'Unirse al espacio',
    'spaces.current-user-joined-space': 'Unido al espacio',
    'spaces.other-user-joined-space': (username) => `${username} se unió al espacio`,
    "spaces.you're-already-in-a-space": 'Ya estás en un espacio',
  },
  fr: {
    'spaces.space': 'Espace',
    'spaces.join-space': "Rejoindre l'espace",
    'spaces.current-user-joined-space': 'Espace rejoint',
    'spaces.other-user-joined-space': (username) => `${username} a rejoint l'espace`,
    "spaces.you're-already-in-a-space": 'Vous êtes déjà dans un espace',
  },
  hi: {
    'spaces.space': 'स्थान',
    'spaces.join-space': 'स्थान जोड़ें',
    'spaces.current-user-joined-space': 'स्थान जुड़ गया',
    'spaces.other-user-joined-space': (username) => `${username} ने स्थान जोड़ा`,
    "spaces.you're-already-in-a-space": 'आप पहले से ही एक स्थान में हैं',
  },
  it: {
    'spaces.space': 'Spazio',
    'spaces.join-space': 'Unisciti allo spazio',
    'spaces.current-user-joined-space': 'Spazio unito',
    'spaces.other-user-joined-space': (username) => `${username} si è unito allo spazio`,
    "spaces.you're-already-in-a-space": 'Sei già in uno spazio',
  },
  ja: {
    'spaces.space': 'スペース',
    'spaces.join-space': 'スペースに参加',
    'spaces.current-user-joined-space': 'スペースに参加しました',
    'spaces.other-user-joined-space': (username) => `${username} がスペースに参加しました`,
    "spaces.you're-already-in-a-space": 'すでにスペースにいます',
  },
  ko: {
    'spaces.space': '공간',
    'spaces.join-space': '공간에 참여',
    'spaces.current-user-joined-space': '공간에 참여함',
    'spaces.other-user-joined-space': (username) => `${username} 가 공간에 참여함`,
    "spaces.you're-already-in-a-space": '이미 공간에 있습니다',
  },
  pt: {
    'spaces.space': 'Espaço',
    'spaces.join-space': 'Junte-se ao espaço',
    'spaces.current-user-joined-space': 'Juntou-se ao espaço',
    'spaces.other-user-joined-space': (username) => `${username} juntou-se ao espaço`,
    "spaces.you're-already-in-a-space": 'Você já está em um espaço',
  },
  ru: {
    'spaces.space': 'Пространство',
    'spaces.join-space': 'Присоединиться к пространству',
    'spaces.current-user-joined-space': 'Присоединился к пространству',
    'spaces.other-user-joined-space': (username) => `${username} присоединился к пространству`,
    "spaces.you're-already-in-a-space": 'Вы уже находитесь в пространстве',
  },
  zh: {
    'spaces.space': '空间',
    'spaces.join-space': '加入空间',
    'spaces.current-user-joined-space': '加入空间',
    'spaces.other-user-joined-space': (username) => `${username} 加入了空间`,
    "spaces.you're-already-in-a-space": '您已经在一个空间中',
  },
}
