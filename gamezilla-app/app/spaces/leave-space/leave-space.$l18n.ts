import { Translations } from "gamezilla-app/@/l18n";
import { Username } from "gamezilla-app/app/@/data";

export type Text = {
	"leave-space.current-user-left": string;
	"leave-space.other-user-left": (username: Username) => string;
};

export const translations: Translations<Text> = {
	en: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	ar: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	de: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	es: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	fr: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	hi: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	it: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	ja: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	ko: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	pt: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	ru: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
	zh: {
		"leave-space.current-user-left": "Left space",
		"leave-space.other-user-left": (username) => `${username} left space`,
	},
};
