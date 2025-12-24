import { Translations } from '~/@/l18n'

export type Text = {
  'app.copied-to-clipboard': string
}

export const translations: Translations<Text> = {
  'app.copied-to-clipboard': {
    en: 'Copied to clipboard',
    es: 'Copiado al portapapeles',
    fr: 'Copié dans le presse-papiers',
    de: 'In die Zwischenablage kopiert',
    it: 'Copiato negli appunti',
    ja: 'クリップボードにコピーしました',
    ko: '클립 보드에 복사됨',
    pt: 'Copiado para a área de transferência',
    ru: 'Скопировано в буфер обмена',
    zh: '已复制到剪贴板',
    hi: 'क्लिपबोर्ड पर कॉपी किया गया',
    ar: 'تم النسخ إلى الحافظة',
  },
}
