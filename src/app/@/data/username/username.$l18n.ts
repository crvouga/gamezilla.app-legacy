import type { Translations } from '~/@/l18n'
import { Username } from './username'

export type Text = {
  'username.username-label': string
  username: (username: Username) => string
}

export const translations: Translations<Text> = {
  username: {
    en: (username) => `@${username}`,
    es: (username) => `@${username}`,
    fr: (username) => `@${username}`,
    de: (username) => `@${username}`,
    it: (username) => `@${username}`,
    ja: (username) => `@${username}`,
    ko: (username) => `@${username}`,
    pt: (username) => `@${username}`,
    ru: (username) => `@${username}`,
    zh: (username) => `@${username}`,
    hi: (username) => `@${username}`,
    ar: (username) => `@${username}`,
  },
  'username.username-label': {
    en: 'Username',
    es: 'Nombre de usuario',
    fr: "Nom d'utilisateur",
    de: 'Benutzername',
    it: 'Nome utente',
    ja: 'ユーザー名',
    ko: '사용자 이름',
    pt: 'Nome de usuário',
    ru: 'Имя пользователя',
    zh: '用户名',
    hi: 'उपयोगकर्ता नाम',
    ar: 'اسم المستخدم',
  },
}
