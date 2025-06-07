import type { Translations } from '~/@/l18n'
import type { PuzzleName } from '.'

export type Text = {
  'numberlink-puzzle-name': (puzzleName: PuzzleName) => string
}

export const translations: Translations<Text> = {
  ar: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  de: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  en: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  es: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  fr: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  hi: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  it: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  ja: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  ko: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  pt: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  ru: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
  zh: {
    'numberlink-puzzle-name': (puzzleName) => `${puzzleName}`,
  },
}
