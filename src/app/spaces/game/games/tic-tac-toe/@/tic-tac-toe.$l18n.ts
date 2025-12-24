import type { Translations } from '~/@/l18n'
import { BotLevel } from './tic-tic-toe/tic-tac-toe'

export type Text = {
  'tic-tac-toe.naught': string
  'tic-tac-toe.cross': string
  'tic-tac-toe.bot-level': (botLevel: BotLevel) => string
}

export const translations: Translations<Text> = {
  'tic-tac-toe.bot-level': {
    en: (botLevel) => {
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
    es: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'F\xE1cil'
        case 'Impossible':
          return 'Imposible'
        case 'Medium':
          return 'Medio'
        default:
          return 'Desconocido'
      }
    },
    fr: (botLevel) => {
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
    de: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'Leicht'
        case 'Impossible':
          return 'Unm\xF6glich'
        case 'Medium':
          return 'Mittel'
        default:
          return 'Unbekannt'
      }
    },
    it: (botLevel) => {
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
    ja: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '\u7C21\u5358'
        case 'Impossible':
          return '\u4E0D\u53EF\u80FD'
        case 'Medium':
          return '\u4E2D'
        default:
          return '\u672A\u77E5'
      }
    },
    ko: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '\uC26C\uC6B4'
        case 'Impossible':
          return '\uBD88\uAC00\uB2A5\uD55C'
        case 'Medium':
          return '\uC911\uAC04'
        default:
          return '\uC54C \uC218 \uC5C6\uB294'
      }
    },
    pt: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'F\xE1cil'
        case 'Impossible':
          return 'Imposs\xEDvel'
        case 'Medium':
          return 'M\xE9dio'
        default:
          return 'Desconhecido'
      }
    },
    ru: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '\u041B\u0435\u0433\u043A\u043E'
        case 'Impossible':
          return '\u041D\u0435\u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E'
        case 'Medium':
          return '\u0421\u0440\u0435\u0434\u043D\u0438\u0439'
        default:
          return '\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E'
      }
    },
    zh: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '\u5BB9\u6613'
        case 'Impossible':
          return '\u4E0D\u53EF\u80FD'
        case 'Medium':
          return '\u4E2D'
        default:
          return '\u672A\u77E5'
      }
    },
    hi: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '\u0906\u0938\u093E\u0928'
        case 'Impossible':
          return '\u0905\u0938\u0902\u092D\u0935'
        case 'Medium':
          return '\u092E\u0927\u094D\u092F\u092E'
        default:
          return '\u0905\u091C\u094D\u091E\u093E\u0924'
      }
    },
    ar: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '\u0633\u0647\u0644'
        case 'Impossible':
          return '\u0645\u0633\u062A\u062D\u064A\u0644'
        case 'Medium':
          return '\u0645\u062A\u0648\u0633\u0637'
        default:
          return '\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641'
      }
    },
  },
  'tic-tac-toe.cross': {
    en: 'Cross',
    es: 'Cruz',
    fr: 'Croix',
    de: 'Kreuz',
    it: 'Croce',
    ja: 'クロス',
    ko: '크로스',
    pt: 'Cruz',
    ru: 'Крест',
    zh: '交叉',
    hi: 'क्रॉस',
    ar: 'صليب',
  },
  'tic-tac-toe.naught': {
    en: 'Naught',
    es: 'Círculo',
    fr: 'Rond',
    de: 'Kreis',
    it: 'Cerchio',
    ja: 'ノート',
    ko: '놋',
    pt: 'Círculo',
    ru: 'Нолик',
    zh: '零',
    hi: 'नॉट',
    ar: 'دائرة',
  },
}
