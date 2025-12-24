import type { Translations } from '~/@/l18n'
import { BotLevel } from '../vs-bot/bot-level'

export type Text = {
  'connect-four.red': string
  'connect-four.yellow': string
  'connect-four.bot-level': (botLevel: BotLevel) => string
}

export const translations: Translations<Text> = {
  'connect-four.bot-level': {
    en: (botLevel) => {
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
    es: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'F\xE1cil'
        case 'Hard':
          return 'Dif\xEDcil'
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
        case 'Hard':
          return 'Difficile'
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
        case 'Hard':
          return 'Schwer'
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
        case 'Hard':
          return 'Difficile'
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
        case 'Hard':
          return '\u96E3\u3057\u3044'
        case 'Medium':
          return '\u4E2D'
        default:
          return '\u4E0D\u660E'
      }
    },
    ko: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '\uC26C\uC6B4'
        case 'Hard':
          return '\uC5B4\uB824\uC6B4'
        case 'Medium':
          return '\uC911\uAC04'
        default:
          return '\uC54C \uC218 \uC5C6\uC74C'
      }
    },
    pt: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return 'F\xE1cil'
        case 'Hard':
          return 'Dif\xEDcil'
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
        case 'Hard':
          return '\u0422\u0440\u0443\u0434\u043D\u043E'
        case 'Medium':
          return '\u0421\u0440\u0435\u0434\u043D\u0438\u0439'
        default:
          return '\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E'
      }
    },
    zh: (botLevel) => {
      switch (botLevel) {
        case 'Easy':
          return '\u7B80\u5355'
        case 'Hard':
          return '\u56F0\u96BE'
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
        case 'Hard':
          return '\u0915\u0920\u093F\u0928'
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
        case 'Hard':
          return '\u0635\u0639\u0628'
        case 'Medium':
          return '\u0645\u062A\u0648\u0633\u0637'
        default:
          return '\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641'
      }
    },
  },
  'connect-four.red': {
    en: 'Red',
    es: 'Rojo',
    fr: 'Rouge',
    de: 'Rot',
    it: 'Rosso',
    ja: '赤',
    ko: '빨강',
    pt: 'Vermelho',
    ru: 'Красный',
    zh: '红色',
    hi: 'लाल',
    ar: 'أحمر',
  },
  'connect-four.yellow': {
    en: 'Yellow',
    es: 'Amarillo',
    fr: 'Jaune',
    de: 'Gelb',
    it: 'Giallo',
    ja: '黄色',
    ko: '노랑',
    pt: 'Amarelo',
    ru: 'Желтый',
    zh: '黄色',
    hi: 'पीला',
    ar: 'أصفر',
  },
}
