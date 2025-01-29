import { p } from '~/@/parser'
import { RPC } from '~/@/rpc'
import { RuntimeEvent } from '~/@/runtime'
import { Posix } from '~/@/time/posix'
import { HttpServerEvent } from '~/@/http-server'
import { AppFrontendModule } from '~/app/@/architecture/app-frontend'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppFrontendCmd } from '~/app/@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '~/app/@/frontend/ctx'
import { AppFrontendEvt } from '~/app/@/frontend/evt'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { BackendInstance } from '~/app/@/backend/backend-instance/backend-instance'
import { IBackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'

export type ModelFrontend = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }

export type MsgBackend =
  | { t: 'got-web-backend-event'; c: HttpServerEvent }
  | { t: 'got-runtime-event'; c: RuntimeEvent }
  | { t: 'heartbeat'; at: Posix }

export type MsgFrontend = { t: 'noop' }

export type FrontendCtx = (AnonymousFrontendCtx | AppFrontendCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}

export type BackendCtx = AppBackendCtx & {
  backendInstanceDb: IBackendInstanceDb
}

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtx
  MsgToBackend: MsgToBackend
  MsgToFrontend: MsgToFrontend
  Msg: MsgBackend
  MsgEvtIn: BackendEvt
  MsgCmdOut: BackendCmd<MsgToFrontend>
}>

export type FrontendModule = AppFrontendModule<{
  Ctx: FrontendCtx
  Model: ModelFrontend
  MsgToBackend: MsgToBackend
  MsgToFrontend: MsgToFrontend
  Msg: MsgBackend
  MsgEvtIn: AppFrontendEvt
  MsgEvtOut: null
  MsgCmdOut: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>
}>

export const rpcContract = RPC.initContract({
  listAlive: {
    input: p.obj({}),
    output: p.obj({
      backendInstances: p.arr(BackendInstance),
    }),
  },
})
