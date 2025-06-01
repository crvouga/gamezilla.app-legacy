import { HttpServerEvent } from '~/@/http-server'
import { RPC } from '~/@/rpc'
import { RuntimeEvent } from '~/@/runtime'
import { s } from '~/@/schema'
import { Posix } from '~/@/time/posix'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { BackendInstance } from '~/app/@/backend/backend-instance/backend-instance'
import { IBackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'

export type ModelFrontend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type MsgBackend =
  | { t: 'got-web-backend-event'; c: HttpServerEvent }
  | { t: 'got-runtime-event'; c: RuntimeEvent }
  | { t: 'heartbeat'; at: Posix }

export type MsgFrontend = { t: 'noop' }

export type FrontendCtx = (AnonymousFrontendCtx | AppFrontendCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}

export type BackendCtxModule = AppBackendCtxBase & {
  backendInstanceDb: IBackendInstanceDb
}

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtxModule
  Msg: MsgBackend
}>

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtx
  Model: ModelFrontend
  Msg: MsgFrontend
}>

export const rpcContract = RPC.initContract({
  'wire/backend-instance/list-alive': {
    input: s.obj({}),
    output: s.obj({
      backendInstances: s.arr(BackendInstance),
    }),
  },
})
