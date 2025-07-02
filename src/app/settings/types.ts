import type { LanguageCodeISO_639_1 } from '~/@/l18n/lang-code-iso-639-1/lang-code-iso-639-1'
import { UnixMs } from '~/@/time/unix-ms'
import { VDomImpl } from '~/@/vdom/vdom-impl'
import { AppFrontendModule } from '../@/architecture/app-frontend'
import { AnonymousFrontendCtx } from '../@/frontend/ctx'
import type { TranslatorMsg } from '../@/frontend/translator'

export type TranslationLoading = {
  startedAt: UnixMs
  endedAt?: UnixMs | null
}

export type ModelFrontend = {
  lang: LanguageCodeISO_639_1
  langLoading: { [lang in LanguageCodeISO_639_1]?: TranslationLoading }
  vDomImpl: VDomImpl
}

export type MsgFrontend =
  | TranslatorMsg
  | { t: 'clicked-change-lang' }
  | { t: 'choose-lang.clicked-done' }
  | { t: 'choose-lang.clicked-lang'; lang: LanguageCodeISO_639_1 }

export type FrontendModule = AppFrontendModule<{
  Ctx: AnonymousFrontendCtx
  Model: ModelFrontend
  Msg: MsgFrontend
}>
