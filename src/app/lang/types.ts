import type { LanguageCodeISO_639_1 } from '~/@/l18n/lang-code-iso-639-1/lang-code-iso-639-1'
import { Posix } from '~/@/time/posix'
import { AppFrontendModule } from '../@/architecture/app-frontend'
import { AppBackendModule } from '../@/architecture/app-backend'
import { AppFrontendCmd } from '../@/frontend/cmd'
import { AnonymousFrontendCtx } from '../@/frontend/ctx'
import { FrontendEvt } from '../@/frontend/evt'
import type { TranslatorMsg } from '../@/frontend/translator'
import { BackendCmd } from '../@/backend/cmd'
import { AppBackendCtx } from '../@/backend/ctx'
import { BackendEvt } from '../@/backend/evt'

export type TranslationLoading = {
  startedAt: Posix
  endedAt?: Posix | null
}

export type ModelFrontend = {
  lang: LanguageCodeISO_639_1
  loading: {
    [lang in LanguageCodeISO_639_1]?: TranslationLoading
  }
}

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type MsgBackend = {
  t: 'user-changed-language'
  lang: LanguageCodeISO_639_1
}

export type MsgFrontend =
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
  MsgToFrontend: MsgToFrontend
  Msg: MsgBackend
  MsgEvtIn: BackendEvt
  MsgCmdOut: BackendCmd<MsgToFrontend>
  MsgEvtOut: null
}>

export type FrontendModule = AppFrontendModule<{
  Ctx: AnonymousFrontendCtx
  Model: ModelFrontend
  MsgToBackend: MsgToBackend
  MsgToFrontend: MsgToFrontend
  Msg: MsgFrontend
  MsgCmdIn: null
  MsgEvtIn: FrontendEvt
  MsgCmdOut: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
  MsgEvtOut: null
}>
