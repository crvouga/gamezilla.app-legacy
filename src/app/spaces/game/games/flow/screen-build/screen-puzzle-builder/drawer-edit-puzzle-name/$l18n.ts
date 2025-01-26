import type { Translations } from '~/@/l18n'

export type Text = {
  'flow.saved-name': string
  'flow.edit-puzzle-name.name-cannot-be-empty': string
  'flow.edit-puzzle-name.name': string
}

export const translations: Translations<Text> = {
  ar: {
    'flow.saved-name': 'تم حفظ الاسم',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'لا يمكن أن يكون الاسم فارغًا',
    'flow.edit-puzzle-name.name': 'الاسم',
  },
  de: {
    'flow.saved-name': 'Name gespeichert',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Name darf nicht leer sein',
    'flow.edit-puzzle-name.name': 'Name',
  },
  en: {
    'flow.saved-name': 'Saved name',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Name cannot be empty',
    'flow.edit-puzzle-name.name': 'Name',
  },
  es: {
    'flow.saved-name': 'Nombre guardado',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'El nombre no puede estar vacío',
    'flow.edit-puzzle-name.name': 'Nombre',
  },
  fr: {
    'flow.saved-name': 'Nom enregistré',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Le nom ne peut pas être vide',
    'flow.edit-puzzle-name.name': 'Nom',
  },
  hi: {
    'flow.saved-name': 'नाम सहेजा गया',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'नाम खाली नहीं हो सकता',
    'flow.edit-puzzle-name.name': 'नाम',
  },
  it: {
    'flow.saved-name': 'Nome salvato',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Il nome non può essere vuoto',
    'flow.edit-puzzle-name.name': 'Nome',
  },
  ja: {
    'flow.saved-name': '名前が保存されました',
    'flow.edit-puzzle-name.name-cannot-be-empty': '名前は空にできません',
    'flow.edit-puzzle-name.name': '名前',
  },
  ko: {
    'flow.saved-name': '이름 저장됨',
    'flow.edit-puzzle-name.name-cannot-be-empty': '이름은 비워 둘 수 없습니다',
    'flow.edit-puzzle-name.name': '이름',
  },
  pt: {
    'flow.saved-name': 'Nome salvo',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'O nome não pode estar vazio',
    'flow.edit-puzzle-name.name': 'Nome',
  },
  ru: {
    'flow.saved-name': 'Имя сохранено',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Имя не может быть пустым',
    'flow.edit-puzzle-name.name': 'Имя',
  },
  zh: {
    'flow.saved-name': '已保存名称',
    'flow.edit-puzzle-name.name-cannot-be-empty': '名称不能为空',
    'flow.edit-puzzle-name.name': '名称',
  },
}
