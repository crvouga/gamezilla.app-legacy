import type { LanguageCodeISO_639_1 } from '~/@/l18n/lang-code-iso-639-1/lang-code-iso-639-1'
import { Posix } from '~/@/time/posix'
import { AppBackendModule } from '../@/architecture/app-backend'
import { AppFrontendModule } from '../@/architecture/app-frontend'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { AnonymousFrontendCtx } from '../@/frontend/ctx'
import type { TranslatorMsg } from '../@/frontend/translator'

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

export type MsgBackend = {
  t: 'user-changed-language'
  lang: LanguageCodeISO_639_1
}

export type MsgFrontend =
  | TranslatorMsg
  | { t: 'clicked-change-lang' }
  | { t: 'choose-lang.clicked-done' }
  | { t: 'choose-lang.clicked-lang'; lang: LanguageCodeISO_639_1 }

export type BackendModule = AppBackendModule<{
  Ctx: AppBackendCtxBase
  Msg: MsgBackend
}>

export type FrontendModule = AppFrontendModule<{
  Ctx: AnonymousFrontendCtx
  Model: ModelFrontend
  Msg: MsgFrontend
}>
