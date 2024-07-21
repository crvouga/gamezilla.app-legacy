import { Translations } from "gamezilla-app/@/l18n";
import { Username } from "gamezilla-app/app/@/data";

export type Text = {
	"spaces.games": string;
	"spaces.current-space": (input: { hostUsername: Username }) => string;
};

export const translations: Translations<Text> = {
	en: {
		"spaces.games": "Games",
		"spaces.current-space": ({ hostUsername }) => `${hostUsername}'s space`,
	},
	ar: {
		"spaces.games": "الألعاب",
		"spaces.current-space": ({ hostUsername }) =>
			`المساحة الحالية لـ ${hostUsername}`,
	},
	de: {
		"spaces.games": "Spiele",
		"spaces.current-space": ({ hostUsername }) => `${hostUsername}s Raum`,
	},
	es: {
		"spaces.games": "Juegos",
		"spaces.current-space": ({ hostUsername }) =>
			`Espacio actual de ${hostUsername}`,
	},
	fr: {
		"spaces.games": "Jeux",
		"spaces.current-space": ({ hostUsername }) =>
			`Espace actuel de ${hostUsername}`,
	},
	hi: {
		"spaces.games": "खेल",
		"spaces.current-space": ({ hostUsername }) => `${hostUsername} का स्थान`,
	},
	it: {
		"spaces.games": "Giochi",
		"spaces.current-space": ({ hostUsername }) =>
			`Spazio attuale di ${hostUsername}`,
	},
	ja: {
		"spaces.games": "ゲーム",
		"spaces.current-space": ({ hostUsername }) => `${hostUsername} のスペース`,
	},
	ko: {
		"spaces.games": "게임",
		"spaces.current-space": ({ hostUsername }) => `${hostUsername}의 공간`,
	},
	pt: {
		"spaces.games": "Jogos",
		"spaces.current-space": ({ hostUsername }) =>
			`Espaço atual de ${hostUsername}`,
	},
	ru: {
		"spaces.games": "игры",
		"spaces.current-space": ({ hostUsername }) =>
			`Текущее пространство ${hostUsername}`,
	},
	zh: {
		"spaces.games": "游戏",
		"spaces.current-space": ({ hostUsername }) => `${hostUsername} 的空间`,
	},
};
