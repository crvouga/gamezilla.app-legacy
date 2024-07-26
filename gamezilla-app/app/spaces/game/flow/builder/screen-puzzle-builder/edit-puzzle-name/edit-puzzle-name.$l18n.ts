import type {Translations} from 'gamezilla-app/@/l18n';

export type Text = {
	'flow.saved-name': string;
	'puzzle.edit-name': string;
};

export const translations: Translations<Text> = {
	ar: {
		'flow.saved-name': 'تم حفظ الاسم',
		'puzzle.edit-name': 'تحرير الاسم',
	},
	de: {
		'flow.saved-name': 'Name gespeichert',
		'puzzle.edit-name': 'Name bearbeiten',
	},
	en: {
		'flow.saved-name': 'Saved name',
		'puzzle.edit-name': 'Edit name',
	},
	es: {
		'flow.saved-name': 'Nombre guardado',
		'puzzle.edit-name': 'Editar nombre',
	},
	fr: {
		'flow.saved-name': 'Nom enregistré',
		'puzzle.edit-name': 'Modifier le nom',
	},
	hi: {
		'flow.saved-name': 'नाम सहेजा गया',
		'puzzle.edit-name': 'नाम संपादित करें',
	},
	it: {
		'flow.saved-name': 'Nome salvato',
		'puzzle.edit-name': 'Modifica nome',
	},
	ja: {
		'flow.saved-name': '名前が保存されました',
		'puzzle.edit-name': '名前を編集',
	},
	ko: {
		'flow.saved-name': '이름 저장됨',
		'puzzle.edit-name': '이름 편집',
	},
	pt: {
		'flow.saved-name': 'Nome salvo',
		'puzzle.edit-name': 'Editar nome',
	},
	ru: {
		'flow.saved-name': 'Имя сохранено',
		'puzzle.edit-name': 'Изменить имя',
	},
	zh: {
		'flow.saved-name': '已保存名称',
		'puzzle.edit-name': '编辑名称',
	},
};
