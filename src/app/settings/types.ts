import { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { ScreenLangTypes } from './screen-lang'
import { ScreenRendererTypes } from './screen-renderer'
import { SoundFrontend } from './sound'

export type ModelFrontendBase = {
  isTopBarSurfaceOpen: boolean
  sound: SoundFrontend.Model
}
export type ModelFrontend = ModelFrontendBase & ScreenLangTypes.ModelFrontend & ScreenRendererTypes.ModelFrontend

export type MsgFrontendBase =
  | { t: 'sound'; c: SoundFrontend.Msg }
  | { t: 'settings.clicked-open-lang' }
  | { t: 'settings.clicked-open-renderer' }
  | { t: 'settings.clicked-open-settings' }
  | { t: 'settings.clicked-back-button' }
  | { t: 'settings.clicked-top-bar' }
  | { t: 'settings.closed-top-bar-surface' }

export type MsgFrontend = MsgFrontendBase | ScreenLangTypes.MsgFrontend | ScreenRendererTypes.MsgFrontend

export type FrontendModule = AppFrontendModule<{
  Ctx: AppFrontendCtxBase
  Model: ModelFrontend
  Msg: MsgFrontend
  ViewSlot: {
    menuItemsEnd: {}
  }
}>
