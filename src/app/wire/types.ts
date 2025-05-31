import { RPC } from '~/@/rpc'
import { Topic } from '~/@/topic'
import { AppBackendModule } from '../@/architecture/app-backend'
import { AppFrontendModule } from '../@/architecture/app-frontend'
import { AppBackendCtxBase } from '../@/backend/ctx'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { BackendConnectionTypes } from './backend-connection'
import { BackendInstanceTypes } from './backend-instance'

export type ModelFrontend = {
  backendInstance: BackendInstanceTypes.ModelFrontend
  backendConnection: BackendConnectionTypes.ModelFrontend
}

export type MsgFrontend =
  | { t: 'got-backend-instance-msg'; c: BackendInstanceTypes.MsgFrontend }
  | { t: 'got-backend-connection-msg'; c: BackendConnectionTypes.MsgFrontend }

export type MsgBackend = { t: 'got-backend-instance-msg'; c: BackendInstanceTypes.MsgBackend }

export const rpcContract = RPC.initContract({
  backendInstance: BackendInstanceTypes.rpcContract,
})

export const topicContract = Topic.initContract({
  backendConnection: BackendConnectionTypes.topicContract,
})

export type FrontendCtxModule = AppFrontendCtxBase & {
  topic: Topic.Client<typeof topicContract>
  rpc: RPC.Client<typeof rpcContract>
}

export type BackendCtxModule = AppBackendCtxBase & {
  backendInstance: BackendInstanceTypes.BackendCtxModule
  backendConnection: BackendConnectionTypes.BackendCtxModule
}

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtxModule
  Model: ModelFrontend
  Msg: MsgFrontend
}>

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtxModule
  Msg: MsgBackend
}>
