import type { LanguageCodeISO_639_1 } from '~/@/l18n/lang-code-iso-639-1/lang-code-iso-639-1'
import { isAnyMsg } from '~/@/msg/msg'
import { UnixMs } from '~/@/time/unix-ms'

export type TranslationLoading = {
  startedAt: UnixMs
  endedAt?: UnixMs | null
}

export type ModelFrontend = {
  lang_lang?: LanguageCodeISO_639_1
  lang_loading?: { [lang in LanguageCodeISO_639_1]?: TranslationLoading }
}

export type MsgFrontend =
  | { t: 'lang_clickedBackButton' }
  //
  | { t: 'lang_clickedLang'; lang: LanguageCodeISO_639_1 }

export const isMsgFrontend = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('lang_')
}
