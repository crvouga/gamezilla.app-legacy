import { Translations } from '~/@/l18n'

export type Text = {
  'app.undo': string
}

export const translations: Translations<Text> = {
  'app.undo': {
    en: 'Undo',
    es: 'Deshacer',
    fr: 'Annuler',
    de: 'Rückgängig machen',
    it: 'Disfare',
    ja: '元に戻す',
    ko: '실행 취소',
    pt: 'Desfazer',
    ru: 'Отменить',
    zh: '撤销',
    hi: 'पूर्ववत करें',
    ar: 'إلغاء',
  },
}
