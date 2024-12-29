import type { Translations } from '~/@/l18n'
import type { PuzzleName } from './puzzle-name'

export type Text = {
  'flow-puzzle-name': (puzzleName: PuzzleName) => string
}

export const translations: Translations<Text> = {
  ar: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  de: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  en: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  es: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  fr: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  hi: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  it: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  ja: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  ko: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  pt: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  ru: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  },
  zh: {
    'flow-puzzle-name': (puzzleName) => `${puzzleName}`
  }
}
