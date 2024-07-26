import type {Translations} from 'gamezilla-app/@/l18n';

export type Text = {
	'auth.logout': string;
	'auth.current-user-logged-out': string;
	'auth.current-user-logged-in': string;
	'auth.continue-with-phone': string;
	'auth.continue-as-guest': string;
	'auth.or': string;
	'auth.sign-in-to': string;
	'auth.logged-in-with-phone': string;
	'auth.logged-in-as-guest': string;
	'auth.logged-in': string;
	'auth.logout-of-gamezill.app': string;
	'auth.logout-of-gamezill.app-body': string;
};

export const translations: Translations<Text> = {
	en: {
		'auth.logout': 'Logout',
		'auth.logged-in-as-guest':
			'Logged in as a guest',
		'auth.logged-in-with-phone':
			'Logged in with phone',
		'auth.current-user-logged-out': 'Logged out',
		'auth.current-user-logged-in': 'Logged in',
		'auth.continue-as-guest': 'Continue as guest',
		'auth.continue-with-phone':
			'Continue with phone',
		'auth.or': 'or',
		'auth.sign-in-to': 'Sign in to',
		'auth.logged-in': 'Logged in',
		'auth.logout-of-gamezill.app':
			'Logout of gamezilla.app?',
		'auth.logout-of-gamezill.app-body':
			'This will log you out of the app. Are you sure?',
	},
	de: {
		'auth.logout': 'Abmelden',
		'auth.logged-in-as-guest':
			'Als Gast angemeldet',
		'auth.logged-in-with-phone':
			'Mit Telefon angemeldet',
		'auth.current-user-logged-out': 'Abgemeldet',
		'auth.current-user-logged-in': 'Angemeldet',
		'auth.continue-as-guest': 'Als Gast fortfahren',
		'auth.continue-with-phone':
			'Mit Telefon fortfahren',
		'auth.or': 'oder',
		'auth.sign-in-to': 'Anmelden bei',
		'auth.logged-in': 'Angemeldet',
		'auth.logout-of-gamezill.app':
			'Von gamezilla.app abmelden',
		'auth.logout-of-gamezill.app-body':
			'Möchtest du dich wirklich abmelden?',
	},
	es: {
		'auth.logout': 'Cerrar sesión',
		'auth.logged-in-as-guest':
			'Conectado como invitado',
		'auth.logged-in-with-phone':
			'Conectado con el teléfono',
		'auth.current-user-logged-out': 'Desconectado',
		'auth.current-user-logged-in': 'Conectado',
		'auth.continue-as-guest':
			'Continuar como invitado',
		'auth.continue-with-phone':
			'Continuar con el teléfono',
		'auth.or': 'o',
		'auth.sign-in-to': 'Iniciar sesión en',
		'auth.logged-in': 'Conectado',
		'auth.logout-of-gamezill.app':
			'Cerrar sesión en gamezilla.app',
		'auth.logout-of-gamezill.app-body':
			'¿Estás seguro de que quieres cerrar sesión?',
	},
	fr: {
		'auth.logout': 'Déconnexion',
		'auth.logged-in-as-guest':
			"Connecté en tant qu'invité",
		'auth.logged-in-with-phone':
			'Connecté avec le téléphone',
		'auth.current-user-logged-out': 'Déconnecté',
		'auth.current-user-logged-in': 'Connecté',
		'auth.continue-as-guest':
			"Continuer en tant qu'invité",
		'auth.continue-with-phone':
			'Continuer avec le téléphone',
		'auth.or': 'ou',
		'auth.sign-in-to': 'Se connecter à',
		'auth.logged-in': 'Connecté',
		'auth.logout-of-gamezill.app':
			'Déconnexion de gamezilla.app',
		'auth.logout-of-gamezill.app-body':
			'Êtes-vous sûr de vouloir vous déconnecter?',
	},
	hi: {
		'auth.logout': 'लॉग आउट',
		'auth.logged-in-as-guest':
			'मेहमान के रूप में लॉग इन',
		'auth.logged-in-with-phone':
			'फोन के साथ लॉग इन',
		'auth.current-user-logged-out': 'लॉग आउट',
		'auth.current-user-logged-in': 'लॉग इन',
		'auth.continue-as-guest':
			'मेहमान के रूप में जारी रखें',
		'auth.continue-with-phone':
			'फोन के साथ जारी रखें',
		'auth.or': 'या',
		'auth.sign-in-to': 'में साइन इन करें',
		'auth.logged-in': 'लॉग इन',
		'auth.logout-of-gamezill.app':
			'gamezilla.app से लॉग आउट करें',
		'auth.logout-of-gamezill.app-body':
			'क्या आप वाकई लॉग आउट करना चाहते हैं?',
	},
	it: {
		'auth.logout': 'Disconnettersi',
		'auth.logged-in-as-guest':
			'Accesso come ospite',
		'auth.logged-in-with-phone':
			'Accesso con telefono',
		'auth.current-user-logged-out': 'Disconnesso',
		'auth.current-user-logged-in': 'Connesso',
		'auth.continue-as-guest':
			'Continua come ospite',
		'auth.continue-with-phone':
			'Continua con il telefono',
		'auth.or': 'o',
		'auth.sign-in-to': 'Accedi a',
		'auth.logged-in': 'Connesso',
		'auth.logout-of-gamezill.app':
			'Disconnettersi da gamezilla.app',
		'auth.logout-of-gamezill.app-body':
			'Sei sicuro di voler uscire?',
	},
	ja: {
		'auth.logout': 'ログアウト',
		'auth.logged-in-as-guest':
			'ゲストとしてログイン',
		'auth.logged-in-with-phone': '電話でログイン',
		'auth.current-user-logged-out':
			'ログアウトしました',
		'auth.current-user-logged-in':
			'ログインしました',
		'auth.continue-as-guest': 'ゲストとして続行',
		'auth.continue-with-phone': '電話で続行',
		'auth.or': 'または',
		'auth.sign-in-to': 'サインイン',
		'auth.logged-in': 'ログインしました',
		'auth.logout-of-gamezill.app':
			'gamezilla.appからログアウト',
		'auth.logout-of-gamezill.app-body':
			'本当にログアウトしますか？',
	},
	ko: {
		'auth.logout': '로그아웃',
		'auth.logged-in-as-guest': '손님으로 로그인됨',
		'auth.logged-in-with-phone': '전화로 로그인됨',
		'auth.current-user-logged-out': '로그아웃됨',
		'auth.current-user-logged-in': '로그인됨',
		'auth.continue-as-guest': '손님으로 계속',
		'auth.continue-with-phone': '전화로 계속',
		'auth.or': '또는',
		'auth.sign-in-to': '로그인',
		'auth.logged-in': '로그인됨',
		'auth.logout-of-gamezill.app':
			'gamezilla.app에서 로그아웃',
		'auth.logout-of-gamezill.app-body':
			'정말 로그아웃 하시겠습니까?',
	},
	pt: {
		'auth.logout': 'Sair',
		'auth.logged-in-as-guest':
			'Logado como convidado',
		'auth.logged-in-with-phone':
			'Logado com o telefone',
		'auth.current-user-logged-out': 'Deslogado',
		'auth.current-user-logged-in': 'Logado',
		'auth.continue-as-guest':
			'Continuar como convidado',
		'auth.continue-with-phone':
			'Continuar com o telefone',
		'auth.or': 'ou',
		'auth.sign-in-to': 'Entrar em',
		'auth.logged-in': 'Logado',
		'auth.logout-of-gamezill.app':
			'Sair do gamezilla.app',
		'auth.logout-of-gamezill.app-body':
			'Tem cert sure que deseja sair?',
	},
	ru: {
		'auth.logout': 'Выйти',
		'auth.logged-in-as-guest': 'Вошел как гость',
		'auth.logged-in-with-phone': 'Вошел с телефона',
		'auth.current-user-logged-out': 'Вышел',
		'auth.current-user-logged-in': 'Вошел',
		'auth.continue-as-guest':
			'Продолжить как гость',
		'auth.continue-with-phone':
			'Продолжить с телефоном',
		'auth.or': 'или',
		'auth.sign-in-to': 'Войти в',
		'auth.logged-in': 'Вошел',
		'auth.logout-of-gamezill.app':
			'Выйти из gamezilla.app',
		'auth.logout-of-gamezill.app-body':
			'Вы уверены, что хотите выйти?',
	},
	zh: {
		'auth.logout': '登出',
		'auth.logged-in-as-guest': '以访客身份登录',
		'auth.logged-in-with-phone': '使用电话登录',
		'auth.current-user-logged-out': '已登出',
		'auth.current-user-logged-in': '已登录',
		'auth.continue-as-guest': '继续以访客身份',
		'auth.continue-with-phone': '继续使用电话',
		'auth.or': '要么',
		'auth.sign-in-to': '登录到',
		'auth.logged-in': '已登录',
		'auth.logout-of-gamezill.app':
			'登出gamezilla.app',
		'auth.logout-of-gamezill.app-body':
			'您确定要登出吗？',
	},
	ar: {
		'auth.logout': 'تسجيل الخروج',
		'auth.logged-in-as-guest':
			'تم تسجيل الدخول كضيف',
		'auth.logged-in-with-phone':
			'تم تسجيل الدخول بالهاتف',
		'auth.current-user-logged-out': 'تسجيل الخروج',
		'auth.current-user-logged-in': 'تسجيل الدخول',
		'auth.continue-as-guest': 'المتابعة كضيف',
		'auth.continue-with-phone': 'المتابعة بالهاتف',
		'auth.or': 'أو',
		'auth.sign-in-to': 'تسجيل الدخول إلى',
		'auth.logged-in': 'تم تسجيل الدخول',
		'auth.logout-of-gamezill.app':
			'تسجيل الخروج من gamezilla.app',
		'auth.logout-of-gamezill.app-body':
			'هل أنت متأكد أنك تريد تسجيل الخروج؟',
	},
};
