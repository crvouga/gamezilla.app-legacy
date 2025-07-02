import { RPC } from '~/@/rpc'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from './@/backend/ctx'
import { AppFrontendCtxBase } from './@/frontend/ctx'
import { AuthTypes } from './auth'
import { FrontendTypes } from './frontend/index'
import { SettingsTypes } from './settings'
import { ProfileTypes } from './profile'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'

export type ModelFrontend = {
  frontend: FrontendTypes.ModelFrontend
  auth: AuthTypes.ModelFrontend
  spaces: SpacesTypes.ModelFrontend
  profile: ProfileTypes.ModelFrontend
  wire: WireTypes.ModelFrontend
  settings: SettingsTypes.ModelFrontend
}

export type MsgFrontend =
  | { t: 'wire'; c: WireTypes.MsgFrontend }
  | { t: 'spaces'; c: SpacesTypes.MsgFrontend }
  | { t: 'auth'; c: AuthTypes.MsgFrontend }
  | { t: 'profile'; c: ProfileTypes.MsgFrontend }
  | { t: 'settings'; c: SettingsTypes.MsgFrontend }
  | { t: 'frontend'; c: FrontendTypes.MsgFrontend }

export const rpcContract = RPC.combineContracts([WireTypes.rpcContract, AuthTypes.rpcContract, SpacesTypes.rpcContract])

export const topicContract = Topic.combineContracts([WireTypes.topicContract, SpacesTypes.topicContract])

export type BackendCtxModule = AppBackendCtxBase &
  WireTypes.BackendCtxModule &
  ProfileTypes.BackendCtxModule &
  SpacesTypes.BackendCtxModule &
  AuthTypes.BackendCtxModule & {
    topic: Topic.Client<typeof topicContract>
  }

export type FrontendCtxModule = AppFrontendCtxBase &
  AuthTypes.FrontendCtxModule &
  ProfileTypes.FrontendCtxModule &
  SpacesTypes.FrontendCtxModule &
  WireTypes.FrontendCtxModule & {
    rpc: RPC.Client<typeof rpcContract>
    topic: Topic.Client<typeof topicContract>
  }
