import { Translations } from "gamezilla-app/@/l18n";
import { Username } from "gamezilla-app/app/@/data";

export type Text = {
	"spaces.end-space": string;
	"spaces.ended-space-host": string;
	"spaces.ended-space-current-user": string;
	"spaces.ended-space-other-user": (username: Username) => string;
};

export const translations: Translations<Text> = {
	en: {
		"spaces.end-space": "End space",
		"spaces.ended-space-host": "Space ended by host",
		"spaces.ended-space-current-user": "Ended space",
		"spaces.ended-space-other-user": (username) => `${username} ended space`,
	},
	ar: {
		"spaces.end-space": "انهاء المساحة",
		"spaces.ended-space-host": "تم انهاء المساحة من قبل المضيف",
		"spaces.ended-space-current-user": "انهاء المساحة",
		"spaces.ended-space-other-user": (username) => `${username} انهاء المساحة`,
	},
	de: {
		"spaces.end-space": "Raum beenden",
		"spaces.ended-space-host": "Raum beendet vom Gastgeber",
		"spaces.ended-space-current-user": "Raum beendet",
		"spaces.ended-space-other-user": (username) => `${username} Raum beendet`,
	},
	es: {
		"spaces.end-space": "Finalizar espacio",
		"spaces.ended-space-host": "Espacio finalizado por el anfitrión",
		"spaces.ended-space-current-user": "Espacio finalizado",
		"spaces.ended-space-other-user": (username) =>
			`${username} finalizó espacio`,
	},
	fr: {
		"spaces.end-space": "Terminer l'espace",
		"spaces.ended-space-host": "Espace terminé par l'hôte",
		"spaces.ended-space-current-user": "Espace terminé",
		"spaces.ended-space-other-user": (username) =>
			`${username} a terminé l'espace`,
	},
	hi: {
		"spaces.end-space": "स्थान समाप्त करें",
		"spaces.ended-space-host": "स्थान मेज़बान द्वारा समाप्त",
		"spaces.ended-space-current-user": "स्थान समाप्त",
		"spaces.ended-space-other-user": (username) =>
			`${username} ने स्थान समाप्त किया`,
	},
	it: {
		"spaces.end-space": "Fine spazio",
		"spaces.ended-space-host": "Spazio terminato dall'host",
		"spaces.ended-space-current-user": "Spazio terminato",
		"spaces.ended-space-other-user": (username) =>
			`${username} ha terminato lo spazio`,
	},
	ja: {
		"spaces.end-space": "スペースを終了",
		"spaces.ended-space-host": "ホストによってスペースが終了しました",
		"spaces.ended-space-current-user": "スペースが終了しました",
		"spaces.ended-space-other-user": (username) =>
			`${username} がスペースを終了しました`,
	},
	ko: {
		"spaces.end-space": "공간 종료",
		"spaces.ended-space-host": "공간 종료됨",
		"spaces.ended-space-current-user": "공간 종료됨",
		"spaces.ended-space-other-user": (username) => `${username} 공간 종료됨`,
	},
	pt: {
		"spaces.end-space": "Finalizar espaço",
		"spaces.ended-space-host": "Espaço finalizado pelo anfitrião",
		"spaces.ended-space-current-user": "Esp espaço finalizado",
		"spaces.ended-space-other-user": (username) =>
			`${username} finalizou espaço`,
	},
	ru: {
		"spaces.end-space": "Завершить пространство",
		"spaces.ended-space-host": "Пространство завершено хостом",
		"spaces.ended-space-current-user": "Пространство завершено",
		"spaces.ended-space-other-user": (username) =>
			`${username} завершил пространство`,
	},
	zh: {
		"spaces.end-space": "结束空间",
		"spaces.ended-space-host": "空间已结束",
		"spaces.ended-space-current-user": "空间已结束",
		"spaces.ended-space-other-user": (username) => `${username} 已结束空间`,
	},
};
