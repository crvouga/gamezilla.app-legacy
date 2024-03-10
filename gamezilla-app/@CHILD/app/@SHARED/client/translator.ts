import { PubSub } from "gamezilla-app/@SHARED/core"
import { LanguageCodeISO_639_1 } from "gamezilla-app/@SHARED/l18n"
import {
  Translator,
  loadTranslator,
} from "gamezilla-app/@SHARED/l18n/generated"

let t: Translator | null = null

export type TranslatorMsg =
  | {
      t: "translator.loading"
      lang: LanguageCodeISO_639_1
    }
  | {
      t: "translator.loaded"
      lang: LanguageCodeISO_639_1
    }

export const translatorSub = PubSub.create<TranslatorMsg>()

export const getTranslator = (
  languageCode: LanguageCodeISO_639_1,
): Translator => {
  if (!t) {
    translatorSub.publish({ t: "translator.loading", lang: languageCode })
    loadTranslator(languageCode).then((loaded) => {
      t = loaded
      translatorSub.publish({ t: "translator.loaded", lang: languageCode })
    })
    return () => ""
  }
  return t
}
