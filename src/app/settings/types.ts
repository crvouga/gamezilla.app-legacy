import { AppFrontendModule } from '../@/architecture/app-frontend'
import { AnonymousFrontendCtx } from '../@/frontend/ctx'
import { ScreenLangTypes } from './screen-lang'
import { ScreenRendererTypes } from './screen-renderer'
import { SoundFrontend } from './sound'

export type ModelFrontendBase = {
  isStatusBarOpen: boolean
  sound: SoundFrontend.Model
}
export type ModelFrontend = ModelFrontendBase & ScreenLangTypes.ModelFrontend & ScreenRendererTypes.ModelFrontend

export type MsgFrontendBase =
  | { t: 'sound'; c: SoundFrontend.Msg }
  | { t: 'settings.clicked-open-lang' }
  | { t: 'settings.clicked-open-renderer' }
  | { t: 'settings.clicked-open-settings' }
  | { t: 'settings.clicked-back-button' }

export type MsgFrontend = MsgFrontendBase | ScreenLangTypes.MsgFrontend | ScreenRendererTypes.MsgFrontend

export type FrontendModule = AppFrontendModule<{
  Ctx: AnonymousFrontendCtx
  Model: ModelFrontend
  Msg: MsgFrontend
}>
