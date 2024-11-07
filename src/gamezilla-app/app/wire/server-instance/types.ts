import { Posix } from '@/core'
import { RuntimeEvent } from '@/runtime'
import { WebServerEvent } from '@/web-server'
import { AppClientModule } from 'gamezilla-app/app/@/architecture/app-client'
import { AppServerModule } from 'gamezilla-app/app/@/architecture/app-server'
import { AnonymousClientCtx, AppClientCmd, AppClientCtx, ClientEvt } from 'gamezilla-app/app/@/client'
import { AppServerCtx, ServerCmd, ServerEvt } from 'gamezilla-app/app/@/server'
import { IServerInstanceDb } from 'gamezilla-app/app/@/server/server-instance/server-instance-db'

export type ModelClient = { t: 'noop' }

export type MsgToServer = { t: 'noop' }

export type MsgToClient = { t: 'noop' }

export type MsgServer =
  | { t: 'got-web-server-event'; c: WebServerEvent }
  | { t: 'got-runtime-event'; c: RuntimeEvent }
  | { t: 'heartbeat'; at: Posix }

export type MsgClient = { t: 'noop' }

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
  Ctx: AnonymousClientCtx | AppClientCtx
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
