import { Sub } from 'gamezilla-app/@/core'
import type { AppServerModule } from '../@/architecture/app-server'
import type { AppServerCtx, ServerCmd, ServerEvt } from '../@/server'
import type { MsgServer, MsgToClient, MsgToServer } from './lang.types'

type ServerModule = AppServerModule<{
  Ctx: AppServerCtx
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgServer
  MsgEvtIn: ServerEvt
  MsgCmdOut: ServerCmd<MsgToClient>
  MsgEvtOut: null
}>

export const update: ServerModule['update'] = async () => {
  return {}
}

export const subscriptions: ServerModule['subscriptions'] = async () => {
  return Sub.None
}

export const initDeps: ServerModule['initDeps'] = async () => {
  return null
}
