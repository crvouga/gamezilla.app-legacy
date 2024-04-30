import { LanguageCodeISO_639_1 } from "gamezilla-app/@shared/l18n/lang-code-iso-639-1/lang-code-iso-639-1"
import { TranslatorMsg } from "../@shared/client/translator"
import { Posix } from "gamezilla-app/@shared/core"

export type TranslationLoading = {
  startedAt: Posix
  endedAt?: Posix | null
}

export type ModelClient = {
  lang: LanguageCodeISO_639_1
  loading: {
    [lang in LanguageCodeISO_639_1]?: TranslationLoading
  }
}

export type MsgToServer = { t: "noop" }

export type MsgToClient = { t: "noop" }

export type MsgServer = {
  t: "user-changed-language"
  lang: LanguageCodeISO_639_1
}

export type MsgClient =
  | TranslatorMsg
  | { t: "clicked-change-lang" }
  | { t: "choose-lang.clicked-done" }
  | { t: "choose-lang.clicked-lang"; lang: LanguageCodeISO_639_1 }
