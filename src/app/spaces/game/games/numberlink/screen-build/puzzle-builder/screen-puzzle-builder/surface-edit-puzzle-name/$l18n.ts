import type { Translations } from '~/@/l18n'

export type Text = {
  'game.numberlink.saved-name': string
  'game.numberlink.edit-puzzle-name.name-cannot-be-empty': string
  'game.numberlink.edit-puzzle-name.name': string
}

export const translations: Translations<Text> = {
  'game.numberlink.edit-puzzle-name.name': {
    en: 'Name',
    es: 'Nombre',
    fr: 'Nom',
    de: 'Name',
    it: 'Nome',
    ja: '名前',
    ko: '이름',
    pt: 'Nome',
    ru: 'Имя',
    zh: '名称',
    hi: 'नाम',
    ar: 'الاسم',
  },
  'game.numberlink.edit-puzzle-name.name-cannot-be-empty': {
    en: 'Name cannot be empty',
    es: 'El nombre no puede estar vacío',
    fr: 'Le nom ne peut pas être vide',
    de: 'Name darf nicht leer sein',
    it: 'Il nome non può essere vuoto',
    ja: '名前は空にできません',
    ko: '이름은 비워 둘 수 없습니다',
    pt: 'O nome não pode estar vazio',
    ru: 'Имя не может быть пустым',
    zh: '名称不能为空',
    hi: 'नाम खाली नहीं हो सकता',
    ar: 'لا يمكن أن يكون الاسم فارغًا',
  },
  'game.numberlink.saved-name': {
    en: 'Saved name',
    es: 'Nombre guardado',
    fr: 'Nom enregistré',
    de: 'Name gespeichert',
    it: 'Nome salvato',
    ja: '名前が保存されました',
    ko: '이름 저장됨',
    pt: 'Nome salvo',
    ru: 'Имя сохранено',
    zh: '已保存名称',
    hi: 'नाम सहेजा गया',
    ar: 'تم حفظ الاسم',
  },
}
