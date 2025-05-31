import { IHttpServer } from '~/@/http-server'
import { RPC } from '~/@/rpc'
import { Topic } from '~/@/topic'
import { AppBackendCtxBase } from './@/backend/ctx'
import { AppFrontendCtxBase } from './@/frontend/ctx'
import { AuthTypes } from './auth'
import * as FrontendTypes from './frontend/types'
import { LangTypes } from './lang'
import { ProfileTypes } from './profile'
import { ProfileBackendCtx } from './profile/@/backend/ctx'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'

//
//
//
//
//
//
//

export type ModelFrontend = {
  frontend: FrontendTypes.ModelFrontend
  auth: AuthTypes.ModelFrontend
  spaces: SpacesTypes.ModelFrontend
  profile: ProfileTypes.ModelFrontend
  wire: WireTypes.ModelFrontend
  lang: LangTypes.ModelFrontend
}

export type MsgBackend =
  | { t: 'wire'; c: WireTypes.MsgBackend }
  | { t: 'spaces'; c: SpacesTypes.MsgBackend }
  | { t: 'profile'; c: ProfileTypes.MsgBackend }
  | { t: 'auth'; c: AuthTypes.MsgBackend }
  | { t: 'lang'; c: LangTypes.MsgBackend }

export type MsgFrontend =
  | { t: 'wire'; c: WireTypes.MsgFrontend }
  | { t: 'spaces'; c: SpacesTypes.MsgFrontend }
  | { t: 'auth'; c: AuthTypes.MsgFrontend }
  | { t: 'profile'; c: ProfileTypes.MsgFrontend }
  | { t: 'lang'; c: LangTypes.MsgFrontend }
  | { t: 'frontend'; c: FrontendTypes.MsgFrontend }

export const rpcContract = RPC.initContract({
  wire: WireTypes.rpcContract,
  auth: AuthTypes.rpcContract,
  spaces: SpacesTypes.rpcContract,
})

export const topicContract = Topic.initContract({
  wire: WireTypes.topicContract,
  spaces: SpacesTypes.topicContract,
})

export type BackendCtxModule = AppBackendCtxBase & {
  wire: WireTypes.BackendCtxModule
  profile: ProfileBackendCtx
  space: SpacesTypes.BackendCtxModule
  auth: AuthTypes.BackendCtx
  httpServer: IHttpServer
  topic: Topic.Client<typeof topicContract>
}

export type FrontendCtxModule = AppFrontendCtxBase &
  AuthTypes.FrontendCtx &
  ProfileTypes.FrontendCtx & {
    rpc: RPC.Client<typeof rpcContract>
    topic: Topic.Client<typeof topicContract>
  }

//
//
//
//
