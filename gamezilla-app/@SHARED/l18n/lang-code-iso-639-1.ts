const ALL = [
  "en",
  "es",
  "fr",
  "de",
  "it",
  "ja",
  "ko",
  "pt",
  "ru",
  "zh",
  "hi",
  "ar",
] as const

export type LanguageCodeISO_639_1 = (typeof ALL)[number]

const is = (code: string): code is LanguageCodeISO_639_1 =>
  ALL.includes(code as LanguageCodeISO_639_1)

export const LanguageCodeISO_639_1 = {
  ALL,
  is,
}
