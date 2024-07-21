import { Translations } from "gamezilla-app/@/l18n";

export type Text = {
	"wire.server-restarted": string;
	"wire.connecting...": string;
	"wire.offline": string;
	"wire.online": string;
	"wire.try-reconnect": string;
};

export const translations: Translations<Text> = {
	en: {
		"wire.server-restarted": "Server restarted",
		"wire.connecting...": "Connecting...",
		"wire.offline": "Offline",
		"wire.online": "Online",
		"wire.try-reconnect": "Try reconnect",
	},
	ar: {
		"wire.server-restarted": "تم إعادة تشغيل الخادم",
		"wire.connecting...": "جاري الاتصال...",
		"wire.offline": "غير متصل",
		"wire.online": "متصل",
		"wire.try-reconnect": "حاول إعادة الاتصال",
	},
	de: {
		"wire.server-restarted": "Server neu gestartet",
		"wire.connecting...": "Verbindung wird hergestellt...",
		"wire.offline": "Offline",
		"wire.online": "Online",
		"wire.try-reconnect": "Erneut verbinden",
	},
	es: {
		"wire.server-restarted": "Servidor reiniciado",
		"wire.connecting...": "Conectando...",
		"wire.offline": "Desconectado",
		"wire.online": "Conectado",
		"wire.try-reconnect": "Intentar reconectar",
	},
	fr: {
		"wire.server-restarted": "Serveur redémarré",
		"wire.connecting...": "Connexion en cours...",
		"wire.offline": "Hors ligne",
		"wire.online": "En ligne",
		"wire.try-reconnect": "Essayer de se reconnecter",
	},
	hi: {
		"wire.server-restarted": "सर्वर पुनः आरंभ हुआ",
		"wire.connecting...": "कनेक्टिंग...",
		"wire.offline": "ऑफलाइन",
		"wire.online": "ऑनलाइन",
		"wire.try-reconnect": "पुनः कनेक्ट करने का प्रयास करें",
	},
	it: {
		"wire.server-restarted": "Server riavviato",
		"wire.connecting...": "Connessione in corso...",
		"wire.offline": "Non in linea",
		"wire.online": "Online",
		"wire.try-reconnect": "Prova a riconnettere",
	},
	ja: {
		"wire.server-restarted": "サーバーが再起動しました",
		"wire.connecting...": "接続中...",
		"wire.offline": "オフライン",
		"wire.online": "オンライン",
		"wire.try-reconnect": "再接続を試みる",
	},
	ko: {
		"wire.server-restarted": "서버 재시작됨",
		"wire.connecting...": "연결 중...",
		"wire.offline": "오프라인",
		"wire.online": "온라인",
		"wire.try-reconnect": "재연결 시도",
	},
	pt: {
		"wire.server-restarted": "Servidor reiniciado",
		"wire.connecting...": "Conectando...",
		"wire.offline": "Offline",
		'wire.online': 'Online',
		"wire.try-reconnect": "Tentar reconectar",
	},
	ru: {
		"wire.server-restarted": "Сервер перезапущен",
		"wire.connecting...": "Подключение...",
		"wire.offline": "Не в сети",
		"wire.online": "В сети",
		"wire.try-reconnect": "Попробовать переподключиться",
	},
	zh: {
		"wire.server-restarted": "服务器重新启动",
		"wire.connecting...": "连接中...",
		"wire.offline": "离线",
		"wire.online": "在线",
		"wire.try-reconnect": "尝试重新连接",
	},
};
