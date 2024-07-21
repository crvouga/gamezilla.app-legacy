import type { Translations } from "gamezilla-app/@/l18n";
import type { FlowPuzzleName } from "./flow-puzzle-name";

export type Text = {
	"flow-puzzle-name": (flowPuzzleName: FlowPuzzleName) => string;
};

export const translations: Translations<Text> = {
	ar: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	de: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	en: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	es: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	fr: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	hi: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	it: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	ja: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	ko: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	pt: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	ru: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
	zh: {
		"flow-puzzle-name": (flowPuzzleName) => `${flowPuzzleName}`,
	},
};
