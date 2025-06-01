import { IHttpServer } from '~/@/http-server'
import { RPC } from '~/@/rpc'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from './@/backend/ctx'
import { AppFrontendCtxBase } from './@/frontend/ctx'
import { AuthTypes } from './auth'
import { FrontendTypes } from './frontend/index'
import { LangTypes } from './lang'
import { ProfileTypes } from './profile'
import { ProfileBackendCtx } from './profile/@/backend/ctx'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'

export type ModelFrontend = {
  frontend: FrontendTypes.ModelFrontend
  auth: AuthTypes.ModelFrontend
  spaces: SpacesTypes.ModelFrontend
  profile: ProfileTypes.ModelFrontend
  wire: WireTypes.ModelFrontend
  lang: LangTypes.ModelFrontend
}

export type MsgFrontend =
  | { t: 'wire'; c: WireTypes.MsgFrontend }
  | { t: 'spaces'; c: SpacesTypes.MsgFrontend }
  | { t: 'auth'; c: AuthTypes.MsgFrontend }
  | { t: 'profile'; c: ProfileTypes.MsgFrontend }
  | { t: 'lang'; c: LangTypes.MsgFrontend }
  | { t: 'frontend'; c: FrontendTypes.MsgFrontend }

export const rpcContract = RPC.combineContracts([WireTypes.rpcContract, AuthTypes.rpcContract, SpacesTypes.rpcContract])

export const topicContract = Topic.combineContracts([WireTypes.topicContract, SpacesTypes.topicContract])

export type BackendCtxModule = AppBackendCtxBase & {
  wire: WireTypes.BackendCtxModule
  profile: ProfileBackendCtx
  spaces: SpacesTypes.BackendCtxModule
  auth: AuthTypes.BackendCtxModule
  httpServer: IHttpServer
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
