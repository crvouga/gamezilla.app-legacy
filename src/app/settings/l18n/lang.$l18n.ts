import type { Translations } from '~/@/l18n'

export type Text = {
  'l18n.language': string
  'l18n.choose-language': string
  'l18n.done': string
  'l18n.loaded-translations': string
}

export const translations: Translations<Text> = {
  'l18n.choose-language': {
    en: 'Choose Language',
    es: 'Elegir idioma',
    fr: 'Choisir la langue',
    de: 'Sprache wählen',
    it: 'Scegli la lingua',
    ja: '言語を選択',
    ko: '언어 선택',
    pt: 'Escolha o idioma',
    ru: 'Выберите язык',
    zh: '选择语言',
    hi: 'भाषा चुनें',
    ar: 'اختر اللغة',
  },
  'l18n.done': {
    en: 'Done',
    es: 'Hecho',
    fr: 'Terminé',
    de: 'Fertig',
    it: 'Fatto',
    ja: '完了',
    ko: '완료',
    pt: 'Feito',
    ru: 'Готово',
    zh: '完成',
    hi: 'किया',
    ar: 'تم',
  },
  'l18n.language': {
    en: 'Language',
    es: 'Idioma',
    fr: 'Langue',
    de: 'Sprache',
    it: 'Lingua',
    ja: '言語',
    ko: '언어',
    pt: 'Língua',
    ru: 'Язык',
    zh: '语言',
    hi: 'भाषा',
    ar: 'اللغة',
  },
  'l18n.loaded-translations': {
    en: 'Loaded translations',
    es: 'Traducciones cargadas',
    fr: 'Traductions chargées',
    de: 'Übersetzungen geladen',
    it: 'Traduzioni caricate',
    ja: '翻訳が読み込まれました',
    ko: '번역이 로드되었습니다',
    pt: 'Traduções carregadas',
    ru: 'Загруженные переводы',
    zh: '已加载翻译',
    hi: 'लोड की गई अनुवाद',
    ar: 'تم تحميل الترجمات',
  },
}
