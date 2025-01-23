import type { Translations } from '~/@/l18n'

export type Text = {
  'flow.saved-name': string
  'puzzle.edit-name': string
  'flow.edit-puzzle-name.name-cannot-be-empty': string
  'flow.edit-puzzle-name.name': string
}

export const translations: Translations<Text> = {
  ar: {
    'flow.saved-name': 'تم حفظ الاسم',
    'puzzle.edit-name': 'تحرير الاسم',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'لا يمكن أن يكون الاسم فارغًا',
    'flow.edit-puzzle-name.name': 'الاسم',
  },
  de: {
    'flow.saved-name': 'Name gespeichert',
    'puzzle.edit-name': 'Name bearbeiten',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Name darf nicht leer sein',
    'flow.edit-puzzle-name.name': 'Name',
  },
  en: {
    'flow.saved-name': 'Saved name',
    'puzzle.edit-name': 'Edit name',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Name cannot be empty',
    'flow.edit-puzzle-name.name': 'Name',
  },
  es: {
    'flow.saved-name': 'Nombre guardado',
    'puzzle.edit-name': 'Editar nombre',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'El nombre no puede estar vacío',
    'flow.edit-puzzle-name.name': 'Nombre',
  },
  fr: {
    'flow.saved-name': 'Nom enregistré',
    'puzzle.edit-name': 'Modifier le nom',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Le nom ne peut pas être vide',
    'flow.edit-puzzle-name.name': 'Nom',
  },
  hi: {
    'flow.saved-name': 'नाम सहेजा गया',
    'puzzle.edit-name': 'नाम संपादित करें',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'नाम खाली नहीं हो सकता',
    'flow.edit-puzzle-name.name': 'नाम',
  },
  it: {
    'flow.saved-name': 'Nome salvato',
    'puzzle.edit-name': 'Modifica nome',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Il nome non può essere vuoto',
    'flow.edit-puzzle-name.name': 'Nome',
  },
  ja: {
    'flow.saved-name': '名前が保存されました',
    'puzzle.edit-name': '名前を編集',
    'flow.edit-puzzle-name.name-cannot-be-empty': '名前は空にできません',
    'flow.edit-puzzle-name.name': '名前',
  },
  ko: {
    'flow.saved-name': '이름 저장됨',
    'puzzle.edit-name': '이름 편집',
    'flow.edit-puzzle-name.name-cannot-be-empty': '이름은 비워 둘 수 없습니다',
    'flow.edit-puzzle-name.name': '이름',
  },
  pt: {
    'flow.saved-name': 'Nome salvo',
    'puzzle.edit-name': 'Editar nome',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'O nome não pode estar vazio',
    'flow.edit-puzzle-name.name': 'Nome',
  },
  ru: {
    'flow.saved-name': 'Имя сохранено',
    'puzzle.edit-name': 'Изменить имя',
    'flow.edit-puzzle-name.name-cannot-be-empty': 'Имя не может быть пустым',
    'flow.edit-puzzle-name.name': 'Имя',
  },
  zh: {
    'flow.saved-name': '已保存名称',
    'puzzle.edit-name': '编辑名称',
    'flow.edit-puzzle-name.name-cannot-be-empty': '名称不能为空',
    'flow.edit-puzzle-name.name': '名称',
  },
}
