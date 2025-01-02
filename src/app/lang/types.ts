import type { LanguageCodeISO_639_1 } from '~/@/l18n/lang-code-iso-639-1/lang-code-iso-639-1'
import { Posix } from '~/@/time/posix'
import { AppClientModule } from '../@/architecture/app-client'
import { AppServerModule } from '../@/architecture/app-server'
import { AppClientCmd } from '../@/client/client-cmd'
import { AnonymousClientCtx } from '../@/client/client-ctx'
import { ClientEvt } from '../@/client/client-evt'
import type { TranslatorMsg } from '../@/client/translator'
import { ServerCmd } from '../@/server/server-cmd'
import { AppServerCtx } from '../@/server/server-ctx'
import { ServerEvt } from '../@/server/server-evt'

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

export type MsgToServer = { t: 'noop' }

export type MsgToClient = { t: 'noop' }

export type MsgServer = {
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

export type ServerModule = AppServerModule<{
  Ctx: AppServerCtx
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgServer
  MsgEvtIn: ServerEvt
  MsgCmdOut: ServerCmd<MsgToClient>
  MsgEvtOut: null
}>

export type ClientModule = AppClientModule<{
  Ctx: AnonymousClientCtx
  Model: ModelClient
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgClient
  MsgCmdIn: null
  MsgEvtIn: ClientEvt
  MsgCmdOut: AppClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
  MsgEvtOut: null
}>
