import { Sub } from "gamezilla-app/@SHARED/core"
import { AppServerModule } from "../../@SHARED/architecture/app-server"
import { ServerCmd, ServerCtx, ServerEvent } from "../../@SHARED/server"
import { ModelServer, MsgServer, MsgToClient, MsgToServer } from "./lang.core"

type Module = AppServerModule<{
  Ctx: ServerCtx
  Deps: {}
  Model: ModelServer
  MsgToServer: MsgToServer
  MsgToClient: MsgToClient
  Msg: MsgServer
  MsgInCmd: null
  MsgInEvent: ServerEvent
  MsgOutCmd: ServerCmd<MsgToClient>
  MsgOutEvent: null
}>

export const init: Module["init"] = async () => {
  return {
    model: {},
  }
}

export const update: Module["update"] = async ({ model }) => {
  return { model }
}

export const subscriptions: Module["subscriptions"] = async () => {
  return Sub.None
}

export const getDeps: Module["getDeps"] = async () => {
  return {}
}
