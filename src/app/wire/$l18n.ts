import type { Translations } from '~/@/l18n'

export type Text = {
  'wire.backend-restarted': string
  'wire.connecting...': string
  'wire.offline': string
  'wire.online': string
  'wire.try-reconnect': string
}

export const translations: Translations<Text> = {
  'wire.backend-restarted': {
    en: 'Backend restarted',
    es: 'Servidor reiniciado',
    fr: 'Serveur redémarré',
    de: 'Backend neu gestartet',
    it: 'Backend riavviato',
    ja: 'サーバーが再起動しました',
    ko: '서버 재시작됨',
    pt: 'Servidor reiniciado',
    ru: 'Сервер перезапущен',
    zh: '服务器重新启动',
    hi: 'सर्वर पुनः आरंभ हुआ',
    ar: 'تم إعادة تشغيل الخادم',
  },
  'wire.connecting...': {
    en: 'Connecting...',
    es: 'Conectando...',
    fr: 'Connexion en cours...',
    de: 'Verbindung wird hergestellt...',
    it: 'Connessione in corso...',
    ja: '接続中...',
    ko: '연결 중...',
    pt: 'Conectando...',
    ru: 'Подключение...',
    zh: '连接中...',
    hi: 'कनेक्टिंग...',
    ar: 'جاري الاتصال...',
  },
  'wire.offline': {
    en: 'Offline',
    es: 'Desconectado',
    fr: 'Hors ligne',
    de: 'Offline',
    it: 'Non in linea',
    ja: 'オフライン',
    ko: '오프라인',
    pt: 'Offline',
    ru: 'Не в сети',
    zh: '离线',
    hi: 'ऑफलाइन',
    ar: 'غير متصل',
  },
  'wire.online': {
    en: 'Online',
    es: 'Conectado',
    fr: 'En ligne',
    de: 'Online',
    it: 'Online',
    ja: 'オンライン',
    ko: '온라인',
    pt: 'Online',
    ru: 'В сети',
    zh: '在线',
    hi: 'ऑनलाइन',
    ar: 'متصل',
  },
  'wire.try-reconnect': {
    en: 'Try reconnect',
    es: 'Intentar reconectar',
    fr: 'Essayer de se reconnecter',
    de: 'Erneut verbinden',
    it: 'Prova a riconnettere',
    ja: '再接続を試みる',
    ko: '재연결 시도',
    pt: 'Tentar reconectar',
    ru: 'Попробовать переподключиться',
    zh: '尝试重新连接',
    hi: 'पुनः कनेक्ट करने का प्रयास करें',
    ar: 'حاول إعادة الاتصال',
  },
}
