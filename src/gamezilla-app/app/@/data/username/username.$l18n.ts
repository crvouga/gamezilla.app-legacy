import type { Translations } from '@/l18n'
import { Username } from './username'

export type Text = {
  'username-title': string
  username: (username: Username) => string
}

export const translations: Translations<Text> = {
  ar: {
    'username-title': 'اسم المستخدم',
    username: (username) => `@${username}`
  },
  de: {
    'username-title': 'Benutzername',
    username: (username) => `@${username}`
  },
  en: {
    'username-title': 'Username',
    username: (username) => `@${username}`
  },
  es: {
    'username-title': 'Nombre de usuario',
    username: (username) => `@${username}`
  },
  fr: {
    'username-title': "Nom d'utilisateur",
    username: (username) => `@${username}`
  },
  hi: {
    'username-title': 'उपयोगकर्ता नाम',
    username: (username) => `@${username}`
  },
  it: {
    'username-title': 'Nome utente',
    username: (username) => `@${username}`
  },
  ja: {
    'username-title': 'ユーザー名',
    username: (username) => `@${username}`
  },
  ko: {
    'username-title': '사용자 이름',
    username: (username) => `@${username}`
  },
  pt: {
    'username-title': 'Nome de usuário',
    username: (username) => `@${username}`
  },
  ru: {
    'username-title': 'Имя пользователя',
    username: (username) => `@${username}`
  },
  zh: {
    'username-title': '用户名',
    username: (username) => `@${username}`
  }
}
