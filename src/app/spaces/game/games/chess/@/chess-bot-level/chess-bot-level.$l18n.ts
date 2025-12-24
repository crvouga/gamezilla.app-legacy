import type { Translations } from '~/@/l18n'
import * as ChessBotLevelTypes from './chess-bot-level.types'

type ChessBotLevel = ChessBotLevelTypes.ChessBotLevel

export type Text = {
  'chess.bot-level': (botLevel: ChessBotLevel) => string
}

export const translations: Translations<Text> = {
  'chess.bot-level': {
    en: (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'Beginner'
        case 1:
          return 'Intermediate'
        case 2:
          return 'Advanced'
        case 3:
          return 'Expert'
        case 4:
          return 'Master'
        default:
          return 'Unknown'
      }
    },
    es: (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'Principiante'
        case 1:
          return 'Intermedio'
        case 2:
          return 'Avanzado'
        case 3:
          return 'Experto'
        case 4:
          return 'Maestro'
        default:
          return 'Desconocido'
      }
    },
    fr: (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'D\xE9butant'
        case 1:
          return 'Interm\xE9diaire'
        case 2:
          return 'Avanc\xE9'
        case 3:
          return 'Expert'
        case 4:
          return 'Ma\xEEtre'
        default:
          return 'Inconnu'
      }
    },
    de: (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'Anf\xE4nger'
        case 1:
          return 'Fortgeschritten'
        case 2:
          return 'Experte'
        case 3:
          return 'Profi'
        case 4:
          return 'Meister'
        default:
          return 'Unbekannt'
      }
    },
    it: (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'Principiante'
        case 1:
          return 'Intermedio'
        case 2:
          return 'Avanzato'
        case 3:
          return 'Esperto'
        case 4:
          return 'Maestro'
        default:
          return 'Sconosciuto'
      }
    },
    ja: (botLevel) => {
      switch (botLevel) {
        case 0:
          return '\u521D\u5FC3\u8005'
        case 1:
          return '\u4E2D\u7D1A'
        case 2:
          return '\u4E0A\u7D1A'
        case 3:
          return '\u30A8\u30AD\u30B9\u30D1\u30FC\u30C8'
        case 4:
          return '\u30DE\u30B9\u30BF\u30FC'
        default:
          return '\u4E0D\u660E'
      }
    },
    ko: (botLevel) => {
      switch (botLevel) {
        case 0:
          return '\uCD08\uBCF4\uC790'
        case 1:
          return '\uC911\uAE09'
        case 2:
          return '\uACE0\uAE09'
        case 3:
          return '\uC804\uBB38\uAC00'
        case 4:
          return '\uB9C8\uC2A4\uD130'
        default:
          return '\uC54C \uC218 \uC5C6\uC74C'
      }
    },
    pt: (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'Iniciante'
        case 1:
          return 'Intermedi\xE1rio'
        case 2:
          return 'Avan\xE7ado'
        case 3:
          return 'Especialista'
        case 4:
          return 'Mestre'
        default:
          return 'Desconhecido'
      }
    },
    ru: (botLevel) => {
      switch (botLevel) {
        case 0:
          return '\u041D\u043E\u0432\u0438\u0447\u043E\u043A'
        case 1:
          return '\u0421\u0440\u0435\u0434\u043D\u0438\u0439'
        case 2:
          return '\u041F\u0440\u043E\u0434\u0432\u0438\u043D\u0443\u0442\u044B\u0439'
        case 3:
          return '\u042D\u043A\u0441\u043F\u0435\u0440\u0442'
        case 4:
          return '\u041C\u0430\u0441\u0442\u0435\u0440'
        default:
          return '\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u043E'
      }
    },
    zh: (botLevel) => {
      switch (botLevel) {
        case 0:
          return '\u521D\u5B66\u8005'
        case 1:
          return '\u4E2D\u7EA7'
        case 2:
          return '\u9AD8\u7EA7'
        case 3:
          return '\u4E13\u5BB6'
        case 4:
          return '\u5927\u5E08'
        default:
          return '\u672A\u77E5'
      }
    },
    hi: (botLevel) => {
      switch (botLevel) {
        case 0:
          return '\u0936\u0941\u0930\u0941\u0906\u0924\u0940'
        case 1:
          return '\u0907\u0902\u091F\u0930\u092E\u0940\u0921\u093F\u090F\u091F'
        case 2:
          return '\u0909\u0928\u094D\u0928\u0924'
        case 3:
          return '\u0935\u093F\u0936\u0947\u0937\u091C\u094D\u091E'
        case 4:
          return '\u092E\u093E\u0938\u094D\u091F\u0930'
        default:
          return '\u0905\u091C\u094D\u091E\u093E\u0924'
      }
    },
    ar: (botLevel) => {
      switch (botLevel) {
        case 0:
          return '\u0645\u0628\u062A\u062F\u0626'
        case 1:
          return '\u0645\u062A\u0648\u0633\u0637'
        case 2:
          return '\u0645\u062A\u0642\u062F\u0645'
        case 3:
          return '\u062E\u0628\u064A\u0631'
        case 4:
          return '\u0645\u0627\u062C\u0633\u062A\u064A\u0631'
        default:
          return '\u063A\u064A\u0631 \u0645\u0639\u0631\u0648\u0641'
      }
    },
  },
}
