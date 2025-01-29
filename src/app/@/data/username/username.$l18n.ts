import type { Translations } from '~/@/l18n'
import { Username } from './username'

export type Text = {
  'username.username-label': string
  username: (username: Username) => string
}

export const translations: Translations<Text> = {
  ar: {
    'username.username-label': 'اسم المستخدم',
    username: (username) => `@${username}`,
  },
  de: {
    'username.username-label': 'Benutzername',
    username: (username) => `@${username}`,
  },
  en: {
    'username.username-label': 'Username',
    username: (username) => `@${username}`,
  },
  es: {
    'username.username-label': 'Nombre de usuario',
    username: (username) => `@${username}`,
  },
  fr: {
    'username.username-label': "Nom d'utilisateur",
    username: (username) => `@${username}`,
  },
  hi: {
    'username.username-label': 'उपयोगकर्ता नाम',
    username: (username) => `@${username}`,
  },
  it: {
    'username.username-label': 'Nome utente',
    username: (username) => `@${username}`,
  },
  ja: {
    'username.username-label': 'ユーザー名',
    username: (username) => `@${username}`,
  },
  ko: {
    'username.username-label': '사용자 이름',
    username: (username) => `@${username}`,
  },
  pt: {
    'username.username-label': 'Nome de usuário',
    username: (username) => `@${username}`,
  },
  ru: {
    'username.username-label': 'Имя пользователя',
    username: (username) => `@${username}`,
  },
  zh: {
    'username.username-label': '用户名',
    username: (username) => `@${username}`,
  },
}
