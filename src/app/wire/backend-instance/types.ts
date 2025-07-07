import { RPC } from '~/@/rpc'
import { s } from '~/@/schema'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { BackendInstance } from '~/app/@/backend/backend-instance/backend-instance'
import { IBackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'
import { AppBackendCtxBase } from '~/app/@/backend/ctx'
import { AppFrontendCtxBase, AppFrontendCtx } from '~/app/@/frontend/ctx'

export type ModelFrontend = { t: 'noop' }

export type MsgFrontend = { t: 'noop' }

export type FrontendCtx = (AppFrontendCtxBase | AppFrontendCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}

export type BackendCtxModule = AppBackendCtxBase & {
  backendInstanceDb: IBackendInstanceDb
}

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
