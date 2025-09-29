import { RPC } from '~/@/rpc'
import { ITopicClient } from '~/@/topic/topic-client/interface'
import { TopicContract } from '~/@/topic/topic-contract'
import { AppBackendCtxBase } from './@/backend/ctx'
import { AppFrontendCtxBase } from './@/frontend/ctx'
import { AuthTypes } from './auth'
import { FrontendTypes } from './frontend/index'
import { ProfileTypes } from './profile'
import { SettingsTypes } from './settings'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'

export type ModelFrontend = FrontendTypes.ModelFrontend &
  AuthTypes.ModelFrontend &
  SpacesTypes.ModelFrontend &
  ProfileTypes.ModelFrontend &
  WireTypes.ModelFrontend &
  SettingsTypes.ModelFrontend

export type MsgFrontend =
  | WireTypes.MsgFrontend
  | SpacesTypes.MsgFrontend
  | AuthTypes.MsgFrontend
  | ProfileTypes.MsgFrontend
  | SettingsTypes.MsgFrontend
  | FrontendTypes.MsgFrontend

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
