import { PubSub } from '@/core'
import type { LanguageCodeISO_639_1, TranslatedText } from '@/l18n'
import { loadTranslator, type Translator } from '@/l18n/generated'

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
  loading: {}
}

export type TranslatorMsg =
  | {
      t: 'translator.loading'
      lang: LanguageCodeISO_639_1
    }
  | {
      t: 'translator.loaded'
      lang: LanguageCodeISO_639_1
    }

export const translatorSubscriptions = PubSub.create<TranslatorMsg>()

function noop(): TranslatedText {
  return '' as TranslatedText
}

export function Translator(languageCode: LanguageCodeISO_639_1): Translator {
  const translator = state.translators[languageCode]

  if (translator && translator.lang === languageCode) {
    state.lastLoaded = languageCode
    return translator.t
  }

  if (state.loading[languageCode]) {
    const lastLoadedTranslator = state.lastLoaded ? state.translators[state.lastLoaded] : null

    return lastLoadedTranslator?.t ?? noop
  }

  state.loading[languageCode] = true
  translatorSubscriptions.pub({
    t: 'translator.loading',
    lang: languageCode
  })

  Promise.all([
    loadTranslator(languageCode),
    state.lastLoaded ? new Promise((r) => setTimeout(r, 0)) : Promise.resolve()
  ]).then(([loaded]) => {
    state.translators[languageCode] = {
      t: loaded,
      lang: languageCode
    }

    state.loading[languageCode] = false

    translatorSubscriptions.pub({
      t: 'translator.loaded',
      lang: languageCode
    })
  })

  return noop
}
