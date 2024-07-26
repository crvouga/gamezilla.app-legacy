import type {Translations} from 'gamezilla-app/@/l18n';

export type Text = {
	'flow.puzzle-removed': string;
	'flow.puzzle-added': string;
	'flow.remove-from-pack': string;
};

export const translations: Translations<Text> = {
	ar: {
		'flow.puzzle-removed': 'تمت إزالة اللغز',
		'flow.puzzle-added': 'تمت إضافة اللغز',
		'flow.remove-from-pack': 'إزالة من الحزمة',
	},
	de: {
		'flow.puzzle-removed': 'Rätsel entfernt',
		'flow.puzzle-added': 'Rätsel hinzugefügt',
		'flow.remove-from-pack':
			'Aus Packung entfernen',
	},
	en: {
		'flow.puzzle-removed': 'Puzzle removed',
		'flow.puzzle-added': 'Puzzle added',
		'flow.remove-from-pack': 'Remove from pack',
	},
	es: {
		'flow.puzzle-removed': 'Rompecabezas eliminado',
		'flow.puzzle-added': 'Rompecabezas añadido',
		'flow.remove-from-pack': 'Eliminar del paquete',
	},
	fr: {
		'flow.puzzle-removed': 'Puzzle supprimé',
		'flow.puzzle-added': 'Puzzle ajouté',
		'flow.remove-from-pack': 'Retirer du pack',
	},
	hi: {
		'flow.puzzle-removed': 'पहेली हटा दी गई',
		'flow.puzzle-added': 'पहेली जोड़ी गई',
		'flow.remove-from-pack': 'पैक से हटाएं',
	},
	it: {
		'flow.puzzle-removed': 'Puzzle rimosso',
		'flow.puzzle-added': 'Puzzle aggiunto',
		'flow.remove-from-pack':
			'Rimuovi dal pacchetto',
	},
	ja: {
		'flow.puzzle-removed': 'パズルが削除されました',
		'flow.puzzle-added': 'パズルが追加されました',
		'flow.remove-from-pack': 'パックから削除',
	},
	ko: {
		'flow.puzzle-removed': '퍼즐이 제거되었습니다',
		'flow.puzzle-added': '퍼즐이 추가되었습니다',
		'flow.remove-from-pack': '팩에서 제거',
	},
	pt: {
		'flow.puzzle-removed': 'Quebra-cabeça removido',
		'flow.puzzle-added': 'Quebra-cabeça adicionado',
		'flow.remove-from-pack': 'Remover do pacote',
	},
	ru: {
		'flow.puzzle-removed': 'Головоломка удалена',
		'flow.puzzle-added': 'Головоломка добавлена',
		'flow.remove-from-pack': 'Удалить из пакета',
	},
	zh: {
		'flow.puzzle-removed': '拼图已删除',
		'flow.puzzle-added': '拼图已添加',
		'flow.remove-from-pack': '从包中删除',
	},
};
