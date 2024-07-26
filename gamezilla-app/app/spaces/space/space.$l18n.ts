import type {Translations} from 'gamezilla-app/@/l18n';
import type {Username} from 'gamezilla-app/app/@/data';

export type Text = {
	'spaces.games': string;
	'spaces.current-space': (input: {
		hostUsername: Username;
	}) => string;
	'spaces.people-count': (peopleCount: number) => string;
	'spaces.home': string;
};

export const translations: Translations<Text> = {
	en: {
		'spaces.games': 'Games',
		'spaces.current-space': ({hostUsername}) =>
			`${hostUsername}'s space`,
		'spaces.home': 'Home',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? 'People'
				: `People (${peopleCount.toLocaleString()})`,
	},
	ar: {
		'spaces.games': 'الألعاب',

		'spaces.current-space': ({hostUsername}) =>
			`المساحة الحالية لـ ${hostUsername}`,
		'spaces.home': 'الصفحة الرئيسية',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? 'الناس'
				: `الناس (${peopleCount.toLocaleString()})`,
	},
	de: {
		'spaces.games': 'Spiele',
		'spaces.current-space': ({hostUsername}) =>
			`${hostUsername}s Raum`,
		'spaces.home': 'Startseite',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? 'Person'
				: `Personen (${peopleCount.toLocaleString()})`,
	},
	es: {
		'spaces.games': 'Juegos',
		'spaces.current-space': ({hostUsername}) =>
			`Espacio actual de ${hostUsername}`,
		'spaces.home': 'Inicio',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? 'Persona'
				: `Personas (${peopleCount.toLocaleString()})`,
	},
	fr: {
		'spaces.games': 'Jeux',
		'spaces.current-space': ({hostUsername}) =>
			`Espace actuel de ${hostUsername}`,
		'spaces.home': 'Accueil',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? 'Personne'
				: `Personnes (${peopleCount.toLocaleString()})`,
	},
	hi: {
		'spaces.games': 'खेल',
		'spaces.current-space': ({hostUsername}) =>
			`${hostUsername} का स्थान`,
		'spaces.home': 'होम',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? 'लोग'
				: `लोग (${peopleCount.toLocaleString()})`,
	},
	it: {
		'spaces.games': 'Giochi',
		'spaces.current-space': ({hostUsername}) =>
			`Spazio attuale di ${hostUsername}`,
		'spaces.home': 'Home',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? 'Persone'
				: `Persone (${peopleCount.toLocaleString()})`,
	},
	ja: {
		'spaces.games': 'ゲーム',
		'spaces.current-space': ({hostUsername}) =>
			`${hostUsername} のスペース`,
		'spaces.home': 'ホーム',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? '人'
				: `人 (${peopleCount.toLocaleString()})`,
	},
	ko: {
		'spaces.games': '게임',
		'spaces.current-space': ({hostUsername}) =>
			`${hostUsername}의 공간`,
		'spaces.home': '홈',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? '사람'
				: `사람들 (${peopleCount.toLocaleString()})`,
	},
	pt: {
		'spaces.games': 'Jogos',
		'spaces.current-space': ({hostUsername}) =>
			`Espaço atual de ${hostUsername}`,
		'spaces.home': 'Início',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? 'Pessoa'
				: `Pessoas (${peopleCount.toLocaleString()})`,
	},
	ru: {
		'spaces.games': 'игры',
		'spaces.current-space': ({hostUsername}) =>
			`Текущее пространство ${hostUsername}`,
		'spaces.home': 'Главная',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? 'Люди'
				: `Люди (${peopleCount.toLocaleString()})`,
	},
	zh: {
		'spaces.games': '游戏',
		'spaces.current-space': ({hostUsername}) =>
			`${hostUsername} 的空间`,
		'spaces.home': '主页',
		'spaces.people-count': (peopleCount) =>
			peopleCount === 1
				? '人'
				: `人 (${peopleCount.toLocaleString()})`,
	},
};
