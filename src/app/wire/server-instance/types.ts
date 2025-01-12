import { p } from '~/@/parser'
import { RPC } from '~/@/rpc'
import { RuntimeEvent } from '~/@/runtime'
import { Posix } from '~/@/time/posix'
import { WebBackendEvent } from '~/@/web-server'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { AppBackendModule } from '~/app/@/architecture/app-server'
import { AppClientCmd } from '~/app/@/client/cmd'
import { AnonymousClientCtx, AppClientCtx } from '~/app/@/client/ctx'
import { ClientEvt } from '~/app/@/client/evt'
import { BackendCmd } from '~/app/@/server/cmd'
import { AppBackendCtx } from '~/app/@/server/ctx'
import { BackendEvt } from '~/app/@/server/evt'
import { BackendInstance } from '~/app/@/server/server-instance/server-instance'
import { IBackendInstanceDb } from '~/app/@/server/server-instance/server-instance-db'

export type ModelClient = { t: 'noop' }

export type MsgToBackend = { t: 'noop' }

export type MsgToClient = { t: 'noop' }

export type MsgBackend =
  | { t: 'got-web-server-event'; c: WebBackendEvent }
  | { t: 'got-runtime-event'; c: RuntimeEvent }
  | { t: 'heartbeat'; at: Posix }

export type MsgClient = { t: 'noop' }

export type ClientCtx = (AnonymousClientCtx | AppClientCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}

export type BackendCtx = AppBackendCtx & {
  serverInstanceDb: IBackendInstanceDb
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
      serverInstances: p.arr(BackendInstance),
    }),
  },
})
