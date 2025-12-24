import type { Translations } from '~/@/l18n'

export type Text = {
  'auth.logged-in-as': string
}

export const translations: Translations<Text> = {
  'auth.logged-in-as': {
    en: 'Logged in as',
    es: 'Conectado como',
    fr: 'Connecté en tant que',
    de: 'Angemeldet als',
    it: 'Accesso come',
    ja: 'としてログイン',
    ko: '으로 로그인됨',
    pt: 'Logado como',
    ru: 'Вошел как',
    zh: '以身份登录',
    hi: 'के रूप में लॉग इन',
    ar: 'تم تسجيل الدخول ك',
  },
}
