import type { Translations } from '~/@/l18n'

export type Text = {
  'prebuilt-actions.exit': string
  'prebuilt-actions.next': string
  'prebuilt-actions.prev': string
  'prebuilt-actions.reset': string
  'prebuilt-actions.hint': string
}

export const translations: Translations<Text> = {
  'prebuilt-actions.exit': {
    en: 'Exit',
    es: 'Salir',
    fr: 'Sortie',
    de: 'Beenden',
    it: 'Uscita',
    ja: '出口',
    ko: '출구',
    pt: 'Saída',
    ru: 'Выход',
    zh: '出口',
    hi: 'निकास',
    ar: 'خروج',
  },
  'prebuilt-actions.hint': {
    en: 'Hint',
    es: 'Sugerencia',
    fr: 'Astuce',
    de: 'Hinweis',
    it: 'Suggerimento',
    ja: 'ヒント',
    ko: '힌트',
    pt: 'Dica',
    ru: 'Подсказка',
    zh: '提示',
    hi: 'सुझाव',
    ar: 'تلميح',
  },
  'prebuilt-actions.next': {
    en: 'Next',
    es: 'Siguiente',
    fr: 'Suivant',
    de: 'Nächster',
    it: 'Il prossimo',
    ja: '次',
    ko: '다음',
    pt: 'Próximo',
    ru: 'Следующий',
    zh: '下一个',
    hi: 'अगला',
    ar: 'التالى',
  },
  'prebuilt-actions.prev': {
    en: 'Prev',
    es: 'Anterior',
    fr: 'Précédent',
    de: 'Vorheriger',
    it: 'Precedente',
    ja: '前',
    ko: '이전',
    pt: 'Anterior',
    ru: 'Предыдущий',
    zh: '以前',
    hi: 'पिछला',
    ar: 'سابق',
  },
  'prebuilt-actions.reset': {
    en: 'Reset',
    es: 'Reiniciar',
    fr: 'Réinitialiser',
    de: 'Zurücksetzen',
    it: 'Ripristina',
    ja: 'リセット',
    ko: '재설정',
    pt: 'Redefinir',
    ru: 'Сброс',
    zh: '重启',
    hi: 'रीसेट',
    ar: 'إعادة تعيين',
  },
}
