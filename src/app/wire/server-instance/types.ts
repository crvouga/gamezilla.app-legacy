import { p } from '~/@/parser'
import { RPC } from '~/@/rpc'
import { RuntimeEvent } from '~/@/runtime'
import { Posix } from '~/@/time/posix'
import { WebServerEvent } from '~/@/web-server'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { AppServerModule } from '~/app/@/architecture/app-server'
import { AppClientCmd } from '~/app/@/client/client-cmd'
import { AnonymousClientCtx, AppClientCtx } from '~/app/@/client/client-ctx'
import { ClientEvt } from '~/app/@/client/client-evt'
import { ServerCmd } from '~/app/@/server/server-cmd'
import { AppServerCtx } from '~/app/@/server/server-ctx'
import { ServerEvt } from '~/app/@/server/server-evt'
import { ServerInstance } from '~/app/@/server/server-instance/server-instance'
import { IServerInstanceDb } from '~/app/@/server/server-instance/server-instance-db'

export type ModelClient = { t: 'noop' }

export type MsgToServer = { t: 'noop' }

export type MsgToClient = { t: 'noop' }

export type MsgServer =
  | { t: 'got-web-server-event'; c: WebServerEvent }
  | { t: 'got-runtime-event'; c: RuntimeEvent }
  | { t: 'heartbeat'; at: Posix }

export type MsgClient = { t: 'noop' }

export type ClientCtx = (AnonymousClientCtx | AppClientCtx) & {
  rpc: RPC.Client<typeof rpcContract>
}

export type ServerCtx = AppServerCtx & {
  serverInstanceDb: IServerInstanceDb
}

export type ServerModule = AppServerModule<{
  Ctx: ServerCtx
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgServer
  MsgEvtIn: ServerEvt
  MsgCmdOut: ServerCmd<MsgToClient>
}>

export type ClientModule = AppClientModule<{
  Ctx: ClientCtx
  Model: ModelClient
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgServer
  MsgEvtIn: ClientEvt
  MsgEvtOut: null
  MsgCmdOut: AppClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
}>

export const rpcContract = RPC.initContract({
  listAlive: {
    input: p.obj({}),
    output: p.obj({
      serverInstances: p.arr(ServerInstance)
    })
  }
})
