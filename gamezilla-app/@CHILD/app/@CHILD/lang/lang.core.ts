import { LanguageCodeISO_639_1 } from "gamezilla-app/@SHARED/l18n/lang-code-iso-639-1/lang-code-iso-639-1"
import { TranslatorMsg } from "../../@SHARED/client/translator"

export type ModelClient = {
  lang: LanguageCodeISO_639_1
  loading: {
    [lang in LanguageCodeISO_639_1]?: boolean
  }
}

export type ModelServer = {}

export type MsgToServer = { t: "noop" }

export type MsgToClient = { t: "noop" }

export type MsgServer = { t: "noop" }

export type MsgClient =
  | TranslatorMsg
  | { t: "clicked-change-lang" }
  | { t: "choose-lang.clicked-done" }
  | { t: "choose-lang.clicked-lang"; lang: LanguageCodeISO_639_1 }
