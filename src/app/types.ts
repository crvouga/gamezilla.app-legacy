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

export type ModelFrontend = CurrentScreenFrontend.Model &
  ToasterFrontend.Model &
  ViewportFrontend.Model &
  ScreenSizeFrontend.Model &
  CopyToClipboardFrontend.Model &
  QueryCache.Model &
  FocusFrontend.Model &
  AuthTypes.ModelFrontend &
  SpacesTypes.ModelFrontend &
  ProfileTypes.ModelFrontend &
  WireTypes.ModelFrontend &
  SettingsTypes.ModelFrontend

export type MsgFrontend =
  | CurrentScreenFrontend.Msg
  | ToasterFrontend.Msg
  | ViewportFrontend.Msg
  | ScreenSizeFrontend.Msg
  | FocusFrontend.Msg
  | CopyToClipboardFrontend.Msg
  | WireTypes.MsgFrontend
  | SpacesTypes.MsgFrontend
  | AuthTypes.MsgFrontend
  | ProfileTypes.MsgFrontend
  | SettingsTypes.MsgFrontend

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
