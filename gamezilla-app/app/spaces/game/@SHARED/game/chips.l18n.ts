import type { Translations } from "gamezilla-app/@shared/l18n";

export type Text = {
	you: string;
	host: string;
};

export const translations: Translations<Text> = {
	ar: {
		host: "المضيف",
		you: "أنت",
	},
	de: {
		host: "Host",
		you: "Du",
	},
	en: {
		host: "Host",
		you: "You",
	},
	es: {
		host: "Anfitrión",
		you: "Tú",
	},
	fr: {
		host: "Hôte",
		you: "Vous",
	},
	hi: {
		host: "मेज़बान",
		you: "तुम",
	},
	it: {
		host: "Ospite",
		you: "Tu",
	},
	ja: {
		host: "ホスト",
		you: "あなた",
	},
	ko: {
		host: "호스트",
		you: "당신",
	},
	pt: {
		host: "Anfitrião",
		you: "Você",
	},
	ru: {
		host: "Хост",
		you: "Вы",
	},
	zh: {
		host: "主持人",
		you: "你",
	},
};
