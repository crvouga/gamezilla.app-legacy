import { AppClientModule } from '../@/architecture/app-client'
import { AppServerModule } from '../@/architecture/app-server'
import { AnonymousClientCtx, AppClientCmd, ClientEvt } from '../@/client'
import { AppServerCtx, ServerCmd, ServerEvt } from '../@/server'
import { IServerInstanceDb } from '../@/server/server-instance/server-instance-db'

export type ModelClient = { t: 'noop' }

export type MsgToServer = { t: 'noop' }

export type MsgToClient = { t: 'noop' }

export type MsgServer = { t: 'noop' }

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
  Ctx: AnonymousClientCtx
  Model: ModelClient
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgClient
  MsgEvtIn: ClientEvt
  MsgCmdOut: AppClientCmd<{
    MsgToServer: MsgToServer
    MsgClient: MsgClient
  }>
}>
