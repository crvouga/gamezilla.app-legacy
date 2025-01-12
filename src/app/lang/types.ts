import type { LanguageCodeISO_639_1 } from '~/@/l18n/lang-code-iso-639-1/lang-code-iso-639-1'
import { Posix } from '~/@/time/posix'
import { AppClientModule } from '../@/architecture/app-client'
import { AppBackendModule } from '../@/architecture/app-server'
import { AppClientCmd } from '../@/client/cmd'
import { AnonymousClientCtx } from '../@/client/ctx'
import { ClientEvt } from '../@/client/evt'
import type { TranslatorMsg } from '../@/client/translator'
import { BackendCmd } from '../@/server/cmd'
import { AppBackendCtx } from '../@/server/ctx'
import { BackendEvt } from '../@/server/evt'

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

export type MsgToBackend = { t: 'noop' }

export type MsgToClient = { t: 'noop' }

export type MsgBackend = {
  t: 'user-changed-language'
  lang: LanguageCodeISO_639_1
}

export type MsgClient =
  | TranslatorMsg
  | { t: 'clicked-change-lang' }
  | { t: 'choose-lang.clicked-done' }
  | {
      t: 'choose-lang.clicked-lang'
      lang: LanguageCodeISO_639_1
    }

export type BackendModule = AppBackendModule<{
  Ctx: AppBackendCtx
  MsgToBackend: MsgToBackend
  MsgToClient: MsgToClient
  Msg: MsgBackend
  MsgEvtIn: BackendEvt
  MsgCmdOut: BackendCmd<MsgToClient>
  MsgEvtOut: null
}>

export type ClientModule = AppClientModule<{
  Ctx: AnonymousClientCtx
  Model: ModelClient
  MsgToBackend: MsgToBackend
  MsgToClient: MsgToClient
  Msg: MsgClient
  MsgCmdIn: null
  MsgEvtIn: ClientEvt
  MsgCmdOut: AppClientCmd<{
    MsgToBackend: MsgToBackend
    MsgClient: MsgClient
  }>
  MsgEvtOut: null
}>
