import { Translations } from '~/@/l18n'

export type Text = {
  home: string
}

export const translations: Translations<Text> = {
  home: {
    en: 'Home',
    es: 'Inicio',
    fr: 'Accueil',
    de: 'Startseite',
    it: 'Pagina principale',
    ja: 'ホーム',
    ko: '홈',
    pt: 'Página inicial',
    ru: 'Главная',
    zh: '首页',
    hi: 'मुखपृष्ठ',
    ar: 'الرئيسية',
  },
}
