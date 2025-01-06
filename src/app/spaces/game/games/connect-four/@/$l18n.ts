import type { Translations } from '~/@/l18n'
import { BotLevel } from '../vs-bot/bot-level'

export type Text = {
  'connect-four.red': string
  'connect-four.yellow': string
  'connect-four.bot-level': (botLevel: BotLevel) => string
}

export const translations: Translations<Text> = {
  en: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Easy'
        case 'Hard':
          return 'Hard'
        case 'Medium':
          return 'Medium'
        default:
          return 'Unknown'
      }
    },
    'connect-four.red': 'Red',
    'connect-four.yellow': 'Yellow',
  },
  ar: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'سهل'
        case 'Hard':
          return 'صعب'
        case 'Medium':
          return 'متوسط'
        default:
          return 'غير معروف'
      }
    },
    'connect-four.red': 'أحمر',
    'connect-four.yellow': 'أصفر',
  },
  de: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Leicht'
        case 'Hard':
          return 'Schwer'
        case 'Medium':
          return 'Mittel'
        default:
          return 'Unbekannt'
      }
    },
    'connect-four.red': 'Rot',
    'connect-four.yellow': 'Gelb',
  },
  es: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Fácil'
        case 'Hard':
          return 'Difícil'
        case 'Medium':
          return 'Medio'
        default:
          return 'Desconocido'
      }
    },
    'connect-four.red': 'Rojo',
    'connect-four.yellow': 'Amarillo',
  },
  fr: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Facile'
        case 'Hard':
          return 'Difficile'
        case 'Medium':
          return 'Moyen'
        default:
          return 'Inconnu'
      }
    },
    'connect-four.red': 'Rouge',
    'connect-four.yellow': 'Jaune',
  },
  hi: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'आसान'
        case 'Hard':
          return 'कठिन'
        case 'Medium':
          return 'मध्यम'
        default:
          return 'अज्ञात'
      }
    },
    'connect-four.red': 'लाल',
    'connect-four.yellow': 'पीला',
  },
  it: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Facile'
        case 'Hard':
          return 'Difficile'
        case 'Medium':
          return 'Medio'
        default:
          return 'Sconosciuto'
      }
    },
    'connect-four.red': 'Rosso',
    'connect-four.yellow': 'Giallo',
  },
  ja: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '簡単'
        case 'Hard':
          return '難しい'
        case 'Medium':
          return '中'
        default:
          return '不明'
      }
    },
    'connect-four.red': '赤',
    'connect-four.yellow': '黄色',
  },
  ko: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '쉬운'
        case 'Hard':
          return '어려운'
        case 'Medium':
          return '중간'
        default:
          return '알 수 없음'
      }
    },
    'connect-four.red': '빨강',
    'connect-four.yellow': '노랑',
  },
  pt: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Fácil'
        case 'Hard':
          return 'Difícil'
        case 'Medium':
          return 'Médio'
        default:
          return 'Desconhecido'
      }
    },
    'connect-four.red': 'Vermelho',
    'connect-four.yellow': 'Amarelo',
  },
  ru: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Легко'
        case 'Hard':
          return 'Трудно'
        case 'Medium':
          return 'Средний'
        default:
          return 'Неизвестно'
      }
    },
    'connect-four.red': 'Красный',
    'connect-four.yellow': 'Желтый',
  },
  zh: {
    'connect-four.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '简单'
        case 'Hard':
          return '困难'
        case 'Medium':
          return '中'
        default:
          return '未知'
      }
    },
    'connect-four.red': '红色',
    'connect-four.yellow': '黄色',
  },
}
