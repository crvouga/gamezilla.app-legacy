import { RPC } from '~/@/rpc'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { TopicContract } from '~/@/topic/topic-contract'
import { AppBackendCtxBase } from './@/backend/ctx'
import { AppFrontendCtxBase } from './@/frontend/ctx'
import { AuthTypes } from './auth'
import { CopyToClipboardFrontend } from './frontend/copy-to-clipboard'
import { CurrentScreenFrontend } from './frontend/current-screen'
import { FocusFrontend } from './frontend/focus'
import { QueryCache } from './frontend/query-cache'
import { ScreenSizeFrontend } from './frontend/screen-size'
import { ToasterFrontend } from './frontend/toaster'
import { ViewportFrontend } from './frontend/viewport'
import { ProfileTypes } from './profile'
import { SettingsTypes } from './settings'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'

export type ModelFrontend = {
  currentScreen: CurrentScreenFrontend.Model
  toaster: ToasterFrontend.Model
  viewport: ViewportFrontend.Model
  screenSize: ScreenSizeFrontend.Model
  copyToClipboard: CopyToClipboardFrontend.Model
  queryCache: QueryCache.Model
  focus: FocusFrontend.Model
  auth: AuthTypes.ModelFrontend
  spaces: SpacesTypes.ModelFrontend
  profile: ProfileTypes.ModelFrontend
  wire: WireTypes.ModelFrontend
  settings: SettingsTypes.ModelFrontend
}

export type MsgFrontend =
  | { t: 'currentScreen'; c: CurrentScreenFrontend.Msg }
  | { t: 'toaster'; c: ToasterFrontend.Msg }
  | { t: 'viewport'; c: ViewportFrontend.Msg }
  | { t: 'screenSize'; c: ScreenSizeFrontend.Msg }
  | { t: 'focus'; c: FocusFrontend.Msg }
  | { t: 'copyToClipboard'; c: CopyToClipboardFrontend.Msg }
  | { t: 'wire'; c: WireTypes.MsgFrontend }
  | { t: 'spaces'; c: SpacesTypes.MsgFrontend }
  | { t: 'auth'; c: AuthTypes.MsgFrontend }
  | { t: 'profile'; c: ProfileTypes.MsgFrontend }
  | { t: 'settings'; c: SettingsTypes.MsgFrontend }
  | { t: 'queryCache'; c: QueryCache.Msg }

export const rpcContract = RPC.combineContracts([AuthTypes.rpcContract, SpacesTypes.rpcContract])

export const topicContract = TopicContract.combine([WireTypes.topicContract, SpacesTypes.topicContract])

export type BackendCtxModule = AppBackendCtxBase &
  WireTypes.BackendCtxModule &
  ProfileTypes.BackendCtxModule &
  SpacesTypes.BackendCtxModule &
  AuthTypes.BackendCtxModule & {
    topic: ITopicClient<typeof topicContract>
  }

export type FrontendCtxModule = AppFrontendCtxBase &
  AuthTypes.FrontendCtxModule &
  ProfileTypes.FrontendCtxModule &
  SpacesTypes.FrontendCtxModule &
  WireTypes.FrontendCtxModule & {
    rpc: RPC.Client<typeof rpcContract>
    topic: ITopicClient<typeof topicContract>
  }
