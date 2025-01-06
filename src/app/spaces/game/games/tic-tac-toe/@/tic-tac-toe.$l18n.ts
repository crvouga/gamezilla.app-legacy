import type { Translations } from '~/@/l18n'
import { BotLevel } from './tic-tic-toe/tic-tac-toe'

export type Text = {
  'tic-tac-toe.naught': string
  'tic-tac-toe.cross': string
  'tic-tac-toe.bot-level': (botLevel: BotLevel) => string
}

export const translations: Translations<Text> = {
  ar: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'سهل'
        case 'Impossible':
          return 'مستحيل'
        case 'Medium':
          return 'متوسط'
        default:
          return 'غير معروف'
      }
    },
    'tic-tac-toe.cross': 'صليب',
    'tic-tac-toe.naught': 'دائرة',
  },
  de: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Leicht'
        case 'Impossible':
          return 'Unmöglich'
        case 'Medium':
          return 'Mittel'
        default:
          return 'Unbekannt'
      }
    },
    'tic-tac-toe.cross': 'Kreuz',
    'tic-tac-toe.naught': 'Kreis',
  },
  en: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Easy'
        case 'Impossible':
          return 'Impossible'
        case 'Medium':
          return 'Medium'
        default:
          return 'Unknown'
      }
    },
    'tic-tac-toe.cross': 'Cross',
    'tic-tac-toe.naught': 'Naught',
  },
  es: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Fácil'
        case 'Impossible':
          return 'Imposible'
        case 'Medium':
          return 'Medio'
        default:
          return 'Desconocido'
      }
    },
    'tic-tac-toe.cross': 'Cruz',
    'tic-tac-toe.naught': 'Círculo',
  },
  fr: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Facile'
        case 'Impossible':
          return 'Impossible'
        case 'Medium':
          return 'Moyen'
        default:
          return 'Inconnu'
      }
    },
    'tic-tac-toe.cross': 'Croix',
    'tic-tac-toe.naught': 'Rond',
  },
  it: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Facile'
        case 'Impossible':
          return 'Impossibile'
        case 'Medium':
          return 'Medio'
        default:
          return 'Sconosciuto'
      }
    },
    'tic-tac-toe.cross': 'Croce',
    'tic-tac-toe.naught': 'Cerchio',
  },
  ja: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '簡単'
        case 'Impossible':
          return '不可能'
        case 'Medium':
          return '中'
        default:
          return '未知'
      }
    },
    'tic-tac-toe.cross': 'クロス',
    'tic-tac-toe.naught': 'ノート',
  },
  pt: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Fácil'
        case 'Impossible':
          return 'Impossível'
        case 'Medium':
          return 'Médio'
        default:
          return 'Desconhecido'
      }
    },
    'tic-tac-toe.cross': 'Cruz',
    'tic-tac-toe.naught': 'Círculo',
  },
  ru: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Легко'
        case 'Impossible':
          return 'Невозможно'
        case 'Medium':
          return 'Средний'
        default:
          return 'Неизвестно'
      }
    },
    'tic-tac-toe.cross': 'Крест',
    'tic-tac-toe.naught': 'Нолик',
  },
  zh: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '容易'
        case 'Impossible':
          return '不可能'
        case 'Medium':
          return '中'
        default:
          return '未知'
      }
    },
    'tic-tac-toe.cross': '交叉',
    'tic-tac-toe.naught': '零',
  },
  hi: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'आसान'
        case 'Impossible':
          return 'असंभव'
        case 'Medium':
          return 'मध्यम'
        default:
          return 'अज्ञात'
      }
    },
    'tic-tac-toe.cross': 'क्रॉस',
    'tic-tac-toe.naught': 'नॉट',
  },
  ko: {
    'tic-tac-toe.bot-level': (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '쉬운'
        case 'Impossible':
          return '불가능한'
        case 'Medium':
          return '중간'
        default:
          return '알 수 없는'
      }
    },
    'tic-tac-toe.cross': '크로스',
    'tic-tac-toe.naught': '놋',
  },
}
