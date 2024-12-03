import { Posix } from '~/@/core'
import { p } from '~/@/core/parser'
import { RPC } from '~/@/rpc'
import { RuntimeEvent } from '~/@/runtime'
import { WebServerEvent } from '~/@/web-server'
import { AppClientModule } from '~/app/@/architecture/app-client'
import { AppServerModule } from '~/app/@/architecture/app-server'
import { AnonymousClientCtx, AppClientCmd, AppClientCtx, ClientEvt } from '~/app/@/client'
import { AppServerCtx, ServerCmd, ServerEvt } from '~/app/@/server'
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
