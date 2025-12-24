import type { Translations } from '~/@/l18n'

export type Text = {
  you: string
  host: string
}

export const translations: Translations<Text> = {
  host: {
    en: 'Host',
    es: 'Anfitrión',
    fr: 'Hôte',
    de: 'Host',
    it: 'Ospite',
    ja: 'ホスト',
    ko: '호스트',
    pt: 'Anfitrião',
    ru: 'Хост',
    zh: '主持人',
    hi: 'मेज़बान',
    ar: 'المضيف',
  },
  you: {
    en: 'You',
    es: 'Tú',
    fr: 'Vous',
    de: 'Du',
    it: 'Tu',
    ja: 'あなた',
    ko: '당신',
    pt: 'Você',
    ru: 'Вы',
    zh: '你',
    hi: 'तुम',
    ar: 'أنت',
  },
}
