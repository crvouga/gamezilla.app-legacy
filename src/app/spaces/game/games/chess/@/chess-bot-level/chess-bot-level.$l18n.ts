import type { Translations } from '~/@/l18n'
import * as ChessBotLevelTypes from './chess-bot-level.types'

type ChessBotLevel = ChessBotLevelTypes.ChessBotLevel

export type Text = {
  'chess.bot-level': (botLevel: ChessBotLevel) => string
}

export const translations: Translations<Text> = {
  en: {
    'chess.bot-level': (botLevel) => {
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
  },
  ar: {
    'chess.bot-level': (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'مبتدئ'
        case 1:
          return 'متوسط'
        case 2:
          return 'متقدم'
        case 3:
          return 'خبير'
        case 4:
          return 'ماجستير'
        default:
          return 'غير معروف'
      }
    },
  },
  de: {
    'chess.bot-level': (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'Anfänger'
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
  },
  es: {
    'chess.bot-level': (botLevel) => {
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
  },
  fr: {
    'chess.bot-level': (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'Débutant'
        case 1:
          return 'Intermédiaire'
        case 2:
          return 'Avancé'
        case 3:
          return 'Expert'
        case 4:
          return 'Maître'
        default:
          return 'Inconnu'
      }
    },
  },
  hi: {
    'chess.bot-level': (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'शुरुआती'
        case 1:
          return 'इंटरमीडिएट'
        case 2:
          return 'उन्नत'
        case 3:
          return 'विशेषज्ञ'
        case 4:
          return 'मास्टर'
        default:
          return 'अज्ञात'
      }
    },
  },
  it: {
    'chess.bot-level': (botLevel) => {
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
  },
  ja: {
    'chess.bot-level': (botLevel) => {
      switch (botLevel) {
        case 0:
          return '初心者'
        case 1:
          return '中級'
        case 2:
          return '上級'
        case 3:
          return 'エキスパート'
        case 4:
          return 'マスター'
        default:
          return '不明'
      }
    },
  },
  ko: {
    'chess.bot-level': (botLevel) => {
      switch (botLevel) {
        case 0:
          return '초보자'
        case 1:
          return '중급'
        case 2:
          return '고급'
        case 3:
          return '전문가'
        case 4:
          return '마스터'
        default:
          return '알 수 없음'
      }
    },
  },
  pt: {
    'chess.bot-level': (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'Iniciante'
        case 1:
          return 'Intermediário'
        case 2:
          return 'Avançado'
        case 3:
          return 'Especialista'
        case 4:
          return 'Mestre'
        default:
          return 'Desconhecido'
      }
    },
  },
  ru: {
    'chess.bot-level': (botLevel) => {
      switch (botLevel) {
        case 0:
          return 'Новичок'
        case 1:
          return 'Средний'
        case 2:
          return 'Продвинутый'
        case 3:
          return 'Эксперт'
        case 4:
          return 'Мастер'
        default:
          return 'Неизвестно'
      }
    },
  },
  zh: {
    'chess.bot-level': (botLevel) => {
      switch (botLevel) {
        case 0:
          return '初学者'
        case 1:
          return '中级'
        case 2:
          return '高级'
        case 3:
          return '专家'
        case 4:
          return '大师'
        default:
          return '未知'
      }
    },
  },
}
