import type { Translations } from "gamezilla-app/@/l18n";

export type Text = {
	"app.something-went-wrong": string;
	"app.exit": string;
};

export const translations: Translations<Text> = {
	en: {
		"app.something-went-wrong": "Something went wrong",
		"app.exit": "Exit",
	},
	ar: {
		"app.something-went-wrong": "حدث خطأ ما",
		"app.exit": "خروج",
	},
	de: {
		"app.something-went-wrong": "Etwas ist schief gelaufen",
		"app.exit": "Beenden",
	},
	es: {
		"app.something-went-wrong": "Algo salió mal",
		"app.exit": "Salir",
	},
	fr: {
		"app.something-went-wrong": "Quelque chose s'est mal passé",
		"app.exit": "Sortie",
	},
	it: {
		"app.something-went-wrong": "Qualcosa è andato storto",
		"app.exit": "Uscita",
	},
	ja: {
		"app.something-went-wrong": "何かがうまくいかなかった",
		"app.exit": "出口",
	},
	ko: {
		"app.something-went-wrong": "문제가 발생했습니다",
		"app.exit": "출구",
	},
	pt: {
		"app.something-went-wrong": "Algo deu errado",
		"app.exit": "Saída",
	},
	ru: {
		"app.something-went-wrong": "Что-то пошло не так",
		"app.exit": "Выход",
	},
	zh: {
		"app.something-went-wrong": "出了点问题",
		"app.exit": "出口",
	},
	hi: {
		"app.something-went-wrong": "कुछ गलत हो गया",
		"app.exit": "निकास",
	},
};
