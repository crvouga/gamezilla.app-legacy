import { Sub } from 'gamezilla-app/@/core'
import type { AppServerModule } from '../@/architecture/app-server'
import type { ServerCmd, AppServerCtx, ServerEvt } from '../@/server'
import type { MsgServer, MsgToClient, MsgToServer } from './lang.types'

type Module = AppServerModule<{
  Ctx: AppServerCtx
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgServer
  MsgEvtIn: ServerEvt
  MsgCmdOut: ServerCmd<MsgToClient>
  MsgEvtOut: null
  Deps: null
}>

export type Deps = null

export const init: Module['init'] = async () => {
  return {}
}

export const update: Module['update'] = async () => {
  return {}
}

export const subscriptions: Module['subscriptions'] = async () => {
  return Sub.None
}

export const initDeps: Module['initDeps'] = async () => {
  return null
}
