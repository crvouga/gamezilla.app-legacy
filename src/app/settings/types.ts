import { isAnyMsg } from '~/@/msg/msg'
import { AppFrontendModule } from '../@/frontend/app-frontend-module'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { ScreenLangTypes } from './screen-lang'
import { ScreenRendererTypes } from './screen-renderer'
import { SoundFrontend } from './sound'

export type ModelFrontendBase = {
  settings_opened?: 'top-bar-surface' | null
}
export type ModelFrontend = ModelFrontendBase &
  ScreenLangTypes.ModelFrontend &
  ScreenRendererTypes.ModelFrontend &
  SoundFrontend.Model

export type MsgFrontendBase =
  | { t: 'settings_clickedOpenLang' }
  | { t: 'settings_clickedOpenRenderer' }
  | { t: 'settings_clickedOpenSettings' }
  | { t: 'settings_clickedBackButton' }
  | { t: 'settings_clickedTopBar' }
  | { t: 'settings_closedTopBarSurface' }

export const isMsgFrontendBase = (msg: unknown): msg is MsgFrontend => {
  return isAnyMsg(msg) && msg.t.startsWith('settings_')
}

export type MsgFrontend =
  | MsgFrontendBase
  | ScreenLangTypes.MsgFrontend
  | ScreenRendererTypes.MsgFrontend
  | SoundFrontend.Msg

export type FrontendCtxModule = AppFrontendCtxBase
export type FrontendModule = AppFrontendModule<{
  Ctx: AppFrontendCtxBase
  Model: ModelFrontend
  Msg: MsgFrontend
  ViewSlot: {
    menuItemsEnd: {}
  }
}>
