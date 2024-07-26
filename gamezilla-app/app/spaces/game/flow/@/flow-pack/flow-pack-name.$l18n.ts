import type {Translations} from 'gamezilla-app/@/l18n';
import type {FlowPackName} from './flow-pack-name';

export type Text = {
	'flow-pack-name': (flowPackName: FlowPackName) => string;
};

export const translations: Translations<Text> = {
	ar: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	de: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	en: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	es: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	fr: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	hi: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	it: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	ja: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	ko: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	pt: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	ru: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
	zh: {
		'flow-pack-name': (flowPackName) =>
			`${flowPackName}`,
	},
};
