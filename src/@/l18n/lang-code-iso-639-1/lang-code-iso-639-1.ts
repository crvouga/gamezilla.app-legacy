import { s } from '~/@/schema'

const ALL = ['en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'pt', 'ru', 'zh', 'hi', 'ar'] as const

export type LanguageCodeISO_639_1 = (typeof ALL)[number]

const schema = s.enumeration(ALL)

const is = (code: unknown): code is LanguageCodeISO_639_1 =>
  typeof code === 'string' && ALL.includes(code as LanguageCodeISO_639_1)

const getLangFromNavigator = (): LanguageCodeISO_639_1 | null => {
  return 'en'
}

export const LanguageCodeISO_639_1 = {
  ALL,
  is,
  getLangFromNavigator,
  schema,
}
