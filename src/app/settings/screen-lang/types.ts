import type { LanguageCodeISO_639_1 } from '~/@/l18n/lang-code-iso-639-1/lang-code-iso-639-1'
import { UnixMs } from '~/@/time/unix-ms'

export type TranslationLoading = {
  startedAt: UnixMs
  endedAt?: UnixMs | null
}

export type ModelFrontend = {
  settings_lang: LanguageCodeISO_639_1
  settings_langLoading: { [lang in LanguageCodeISO_639_1]?: TranslationLoading }
}

export type MsgFrontend = { t: 'lang.clicked-back-button' } | { t: 'lang.clicked-lang'; lang: LanguageCodeISO_639_1 }
