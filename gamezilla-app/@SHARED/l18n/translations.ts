export const LANGUAGE_CODE_ISO_639_1 = [
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

export type LanguageCodeISO_639_1 = (typeof LANGUAGE_CODE_ISO_639_1)[number]

export const isLanguageCodeISO_639_1 = (
  code: string,
): code is LanguageCodeISO_639_1 =>
  LANGUAGE_CODE_ISO_639_1.includes(code as LanguageCodeISO_639_1)

export type TranslationText = {
  [key: string]: string | ((...args: any[]) => string)
}

export type Translations<TText extends TranslationText> = {
  [lang in LanguageCodeISO_639_1]: TText
}

// export const T =
//   <
//     TTranslationText extends TranslationText,
//     TTranslations extends Translations<TTranslationText>,
//   >(
//     languageCode: LanguageCode,
//     translations: TTranslations,
//   ) =>
//   <
//     K extends keyof TTranslations,
//     Args extends TTranslations[K] extends (...args: any[]) => any
//       ? Parameters<TTranslations[K]>
//       : [],
//   >(
//     key: K,
//     ...args: Args
//   ): string => {
//     const translation = translations[key]

//     if (typeof translation === "function") {
//       const result = translation(...(args as any))
//       return result[languageCode] ?? "Translation not found"
//     } else {
//       return translation?.[languageCode] ?? "Translation not found"
//     }
// }
