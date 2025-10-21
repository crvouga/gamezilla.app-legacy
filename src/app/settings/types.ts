import { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { ScreenLangTypes } from './screen-lang'
import { ScreenRendererTypes } from './screen-renderer'
import { SoundFrontend } from './sound'

export type ModelFrontend = {
  settings_opened?: 'top-bar-surface' | null
  lang: ScreenLangTypes.ModelFrontend
  renderer: ScreenRendererTypes.ModelFrontend
  sound: SoundFrontend.Model
}

export type MsgFrontend =
  | { t: 'settings_clickedOpenLang' }
  | { t: 'settings_clickedOpenRenderer' }
  | { t: 'settings_clickedOpenSettings' }
  | { t: 'settings_clickedBackButton' }
  | { t: 'settings_clickedTopBar' }
  | { t: 'settings_closedTopBarSurface' }
  | { t: 'lang'; c: ScreenLangTypes.MsgFrontend }
  | { t: 'renderer'; c: ScreenRendererTypes.MsgFrontend }
  | { t: 'sound'; c: SoundFrontend.Msg }

export type FrontendCtxModule = AppFrontendCtxBase
export type FrontendModule = AppFrontendModule<{
  Ctx: AppFrontendCtxBase
  Model: ModelFrontend
  Msg: MsgFrontend
  ViewSlot: {
    menuItemsEnd: {}
  }
}>
