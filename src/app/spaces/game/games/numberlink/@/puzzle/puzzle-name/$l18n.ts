import type { Translations } from '~/@/l18n'
import type { PuzzleName } from '.'

export type Text = {
  'numberlink-puzzle-name': (puzzleName: PuzzleName) => string
}

export const translations: Translations<Text> = {
  'numberlink-puzzle-name': {
    en: (puzzleName) => `${puzzleName}`,
    es: (puzzleName) => `${puzzleName}`,
    fr: (puzzleName) => `${puzzleName}`,
    de: (puzzleName) => `${puzzleName}`,
    it: (puzzleName) => `${puzzleName}`,
    ja: (puzzleName) => `${puzzleName}`,
    ko: (puzzleName) => `${puzzleName}`,
    pt: (puzzleName) => `${puzzleName}`,
    ru: (puzzleName) => `${puzzleName}`,
    zh: (puzzleName) => `${puzzleName}`,
    hi: (puzzleName) => `${puzzleName}`,
    ar: (puzzleName) => `${puzzleName}`,
  },
}
