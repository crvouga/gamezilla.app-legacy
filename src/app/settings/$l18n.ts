import type { Translations } from '~/@/l18n'

export type Text = {
  'l18n.language': string
  'l18n.choose-language': string
  'l18n.done': string
  'l18n.loaded-translations': string
}

export const translations: Translations<Text> = {
  en: {
    'l18n.language': 'Language',
    'l18n.choose-language': 'Choose Language',
    'l18n.done': 'Done',
    'l18n.loaded-translations': 'Loaded translations',
  },
  ar: {
    'l18n.language': 'اللغة',
    'l18n.choose-language': 'اختر اللغة',
    'l18n.done': 'تم',
    'l18n.loaded-translations': 'تم تحميل الترجمات',
  },
  de: {
    'l18n.language': 'Sprache',
    'l18n.choose-language': 'Sprache wählen',
    'l18n.done': 'Fertig',
    'l18n.loaded-translations': 'Übersetzungen geladen',
  },
  es: {
    'l18n.language': 'Idioma',
    'l18n.choose-language': 'Elegir idioma',
    'l18n.done': 'Hecho',
    'l18n.loaded-translations': 'Traducciones cargadas',
  },
  fr: {
    'l18n.language': 'Langue',
    'l18n.choose-language': 'Choisir la langue',
    'l18n.done': 'Terminé',
    'l18n.loaded-translations': 'Traductions chargées',
  },
  hi: {
    'l18n.language': 'भाषा',
    'l18n.choose-language': 'भाषा चुनें',
    'l18n.done': 'किया',
    'l18n.loaded-translations': 'लोड की गई अनुवाद',
  },
  it: {
    'l18n.language': 'Lingua',
    'l18n.choose-language': 'Scegli la lingua',
    'l18n.done': 'Fatto',
    'l18n.loaded-translations': 'Traduzioni caricate',
  },
  ja: {
    'l18n.language': '言語',
    'l18n.choose-language': '言語を選択',
    'l18n.done': '完了',
    'l18n.loaded-translations': '翻訳が読み込まれました',
  },
  ko: {
    'l18n.language': '언어',
    'l18n.choose-language': '언어 선택',
    'l18n.done': '완료',
    'l18n.loaded-translations': '번역이 로드되었습니다',
  },
  pt: {
    'l18n.language': 'Língua',
    'l18n.choose-language': 'Escolha o idioma',
    'l18n.done': 'Feito',
    'l18n.loaded-translations': 'Traduções carregadas',
  },
  ru: {
    'l18n.language': 'Язык',
    'l18n.choose-language': 'Выберите язык',
    'l18n.done': 'Готово',
    'l18n.loaded-translations': 'Загруженные переводы',
  },
  zh: {
    'l18n.language': '语言',
    'l18n.choose-language': '选择语言',
    'l18n.done': '完成',
    'l18n.loaded-translations': '已加载翻译',
  },
}
