import { Translations } from '~/@/l18n'

export type Text = {
  'app.this-action-cannot-be-undone': string
}

export const translations: Translations<Text> = {
  'app.this-action-cannot-be-undone': {
    en: 'This action cannot be undone',
    es: 'Esta acción no se puede deshacer',
    fr: 'Cette action est irréversible',
    de: 'Dieser Vorgang kann nicht rückgängig gemacht werden',
    it: 'Questa azione non può essere annullata',
    ja: 'この操作は取り消せません',
    ko: '이 작업은 취소할 수 없습니다',
    pt: 'Esta ação não pode ser desfeita',
    ru: 'Это действие нельзя отменить',
    zh: '此操作无法撤消',
    hi: 'यह कार्रवाई पूर्ववत नहीं की जा सकती',
    ar: 'لا يمكن التراجع عن هذا الإجراء',
  },
}
