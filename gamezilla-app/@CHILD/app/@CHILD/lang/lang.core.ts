import { LanguageCodeISO_639_1 } from "gamezilla-app/@SHARED/l18n/lang-code-iso-639-1"

export type ModelClient = {
  lang: LanguageCodeISO_639_1
}

export type ModelServer = {}

export type MsgToServer = { t: "noop" }

export type MsgToClient = { t: "noop" }

export type MsgServer = { t: "noop" }

export type MsgClient = { t: "noop" }
