import { Translations } from "gamezilla-app/@/l18n";

export type Text = {
	"wire.server-restarted": string;
	"wire.connecting...": string;
	"wire.offline": string;
};

export const translations: Translations<Text> = {
	en: {
		"wire.server-restarted": "Server restarted",
		"wire.connecting...": "Connecting...",
		"wire.offline": "Offline",
	},
	ar: {
		"wire.server-restarted": "تم إعادة تشغيل الخادم",
		"wire.connecting...": "جاري الاتصال...",
		"wire.offline": "غير متصل",
	},
	de: {
		"wire.server-restarted": "Server neu gestartet",
		"wire.connecting...": "Verbindung wird hergestellt...",
		"wire.offline": "Offline",
	},
	es: {
		"wire.server-restarted": "Servidor reiniciado",
		"wire.connecting...": "Conectando...",
		"wire.offline": "Desconectado",
	},
	fr: {
		"wire.server-restarted": "Serveur redémarré",
		"wire.connecting...": "Connexion en cours...",
		"wire.offline": "Hors ligne",
	},
	hi: {
		"wire.server-restarted": "सर्वर पुनः आरंभ हुआ",
		"wire.connecting...": "कनेक्टिंग...",
		"wire.offline": "ऑफलाइन",
	},
	it: {
		"wire.server-restarted": "Server riavviato",
		"wire.connecting...": "Connessione in corso...",
		"wire.offline": "Non in linea",
	},
	ja: {
		"wire.server-restarted": "サーバーが再起動しました",
		"wire.connecting...": "接続中...",
		"wire.offline": "オフライン",
	},
	ko: {
		"wire.server-restarted": "서버 재시작됨",
		"wire.connecting...": "연결 중...",
		"wire.offline": "오프라인",
	},
	pt: {
		"wire.server-restarted": "Servidor reiniciado",
		"wire.connecting...": "Conectando...",
		"wire.offline": "Offline",
	},
	ru: {
		"wire.server-restarted": "Сервер перезапущен",
		"wire.connecting...": "Подключение...",
		"wire.offline": "Не в сети",
	},
	zh: {
		"wire.server-restarted": "服务器重新启动",
		"wire.connecting...": "连接中...",
		"wire.offline": "离线",
	},
};
