import { PubSub } from "gamezilla-app/@SHARED/core"
import { LanguageCodeISO_639_1 } from "gamezilla-app/@SHARED/l18n"
import {
  Translator,
  loadTranslator,
} from "gamezilla-app/@SHARED/l18n/generated"

const state: {
  lastLoaded: LanguageCodeISO_639_1 | null
  translators: {
    [lang in LanguageCodeISO_639_1]?: {
      t: Translator
      lang: LanguageCodeISO_639_1
    }
  }
  loading: {
    [lang in LanguageCodeISO_639_1]?: boolean
  }
} = {
  lastLoaded: null,
  translators: {},
  loading: {},
}

export type TranslatorMsg =
  | {
      t: "translator.loading"
      lang: LanguageCodeISO_639_1
    }
  | {
      t: "translator.loaded"
      lang: LanguageCodeISO_639_1
    }

export const translatorSubscriptions = PubSub.create<TranslatorMsg>()

translatorSubscriptions.subscribe((msg) => {
  switch (msg.t) {
    case "translator.loaded": {
      state.loading[msg.lang] = false
      break
    }
    case "translator.loading": {
      state.loading[msg.lang] = true
      break
    }
  }
})

const noop: Translator = () => "..."

export const getTranslator = (
  languageCode: LanguageCodeISO_639_1,
): Translator => {
  const translator = state.translators[languageCode]

  if (translator && translator.lang === languageCode) {
    state.lastLoaded = languageCode
    return translator.t
  }

  if (state.loading[languageCode]) {
    const lastLoadedTranslator = state.lastLoaded
      ? state.translators[state.lastLoaded]
      : null

    return lastLoadedTranslator?.t ?? noop
  }

  translatorSubscriptions.publish({
    t: "translator.loading",
    lang: languageCode,
  })

  Promise.all([
    loadTranslator(languageCode),
    state.lastLoaded
      ? new Promise((r) => setTimeout(r, 3000))
      : Promise.resolve(),
  ]).then(([loaded]) => {
    state.translators[languageCode] = {
      t: loaded,
      lang: languageCode,
    }

    translatorSubscriptions.publish({
      t: "translator.loaded",
      lang: languageCode,
    })
  })

  return noop
}
