import { Sub } from "gamezilla-app/@shared/core"
import { AppServerModule } from "../@shared/architecture/app-server"
import { ServerCmd, ServerCtx, ServerEvent } from "../@shared/server"
import { MsgServer, MsgToClient, MsgToServer } from "./lang.core"

type Module = AppServerModule<{
  Ctx: ServerCtx
  Deps: null
  Model: null
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgServer
  MsgInCmd: null
  MsgInEvent: ServerEvent
  MsgOutCmd: ServerCmd<MsgToClient>
  MsgOutEvent: null
}>

export type Deps = null

export const init: Module["init"] = async () => {
  return {
    model: null,
  }
}

export const update: Module["update"] = async ({ model }) => {
  return { model }
}

export const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None
}

export const getDeps: Module["getDeps"] = async () => {
  return null
}
