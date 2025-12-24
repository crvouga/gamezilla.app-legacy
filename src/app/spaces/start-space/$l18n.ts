import type { Translations } from '~/@/l18n'

export type Text = {
  'spaces.start-space': string
  'spaces.space-started': string
}

export const translations: Translations<Text> = {
  'spaces.space-started': {
    en: 'Space started',
    es: 'Espacio iniciado',
    fr: 'Espace démarré',
    de: 'Raum gestartet',
    it: 'Spazio avviato',
    ja: 'スペースが開始されました',
    ko: '공간 시작됨',
    pt: 'Espaço iniciado',
    ru: 'Пространство началось',
    zh: '空间已开始',
    hi: 'स्थान शुरू हो गया',
    ar: 'بدأت المساحة',
  },
  'spaces.start-space': {
    en: 'Start space',
    es: 'Iniciar espacio',
    fr: "Démarrer l'espace",
    de: 'Raum starten',
    it: 'Inizia spazio',
    ja: 'スペースを開始',
    ko: '공간 시작',
    pt: 'Iniciar espaço',
    ru: 'Начать пространство',
    zh: '开始空间',
    hi: 'स्थान शुरू करें',
    ar: 'بدء المساحة',
  },
}
