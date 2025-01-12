import { p } from '~/@/parser'
import { RPC } from '~/@/rpc'
import { RuntimeEvent } from '~/@/runtime'
import { Posix } from '~/@/time/posix'
import { WebBackendEvent } from '~/@/web-backend'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { AppBackendModule } from '~/app/@/architecture/app-backend'
import { AppClientCmd } from '~/app/@/client/cmd'
import { AnonymousClientCtx, AppClientCtx } from '~/app/@/client/ctx'
import { ClientEvt } from '~/app/@/client/evt'
import { BackendCmd } from '~/app/@/backend/cmd'
import { AppBackendCtx } from '~/app/@/backend/ctx'
import { BackendEvt } from '~/app/@/backend/evt'
import { BackendInstance } from '~/app/@/backend/backend-instance/backend-instance'
import { IBackendInstanceDb } from '~/app/@/backend/backend-instance/backend-instance-db'

export type ModelClient = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToClient = { t: 'noop' }

export type MsgBackend =
  | { t: 'got-web-backend-event'; c: WebBackendEvent }
  | { t: 'got-runtime-event'; c: RuntimeEvent }
  | { t: 'heartbeat'; at: Posix }

export type MsgClient = { t: 'noop' }

export type ClientCtx = (AnonymousClientCtx | AppClientCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}

export type BackendCtx = AppBackendCtx & {
  backendInstanceDb: IBackendInstanceDb
}

export type BackendModule = AppBackendModule<{
  Ctx: BackendCtx
  MsgToBackend: MsgToBackend
  MsgToClient: MsgToClient
  Msg: MsgBackend
  MsgEvtIn: BackendEvt
  MsgCmdOut: BackendCmd<MsgToClient>
}>

export type ClientModule = AppClientModule<{
  Ctx: ClientCtx
  Model: ModelClient
  MsgToBackend: MsgToBackend
  MsgToClient: MsgToClient
  Msg: MsgBackend
  MsgEvtIn: ClientEvt
  MsgEvtOut: null
  MsgCmdOut: AppClientCmd<{
    MsgToBackend: MsgToBackend
    MsgClient: MsgClient
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
