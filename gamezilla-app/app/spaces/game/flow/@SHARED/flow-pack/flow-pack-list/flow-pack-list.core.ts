import {
  SpaceClientCtx,
  SpaceClientEvent,
  SpaceServerCtx,
  SpaceServerEvent,
} from "gamezilla-app/app/spaces/@shared/space"
import { SpaceClientCmd } from "gamezilla-app/app/spaces/@shared/space-client-cmd"
import { SpaceServerCmd } from "gamezilla-app/app/spaces/@shared/space-server-cmd"
import { AppClientModule } from "gamezilla-app/app/@shared/architecture/app-client"
import { AppServerModule } from "gamezilla-app/app/@shared/architecture/app-server"
import { RemoteResult, RequestResponse } from "gamezilla-app/@shared/core"
import { IFlowPackDb } from "../flow-pack-db"
import { FlowPackId } from "../flow-pack-id"
import { FlowPack } from "../flow-pack"
import { p } from "gamezilla-app/@shared/core/parser"

//
//
//
//
//

export type ClientModule = AppClientModule<{
  Model: ModelClient
  Msg: MsgClient
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: SpaceClientCtx
  MsgInCmd: never
  MsgInEvent: SpaceClientEvent
  MsgOutCmd: SpaceClientCmd<{
    MsgClient: MsgClient
    MsgToServer: MsgToServer
  }>
  MsgOutEvent: SpaceClientEvent
  ViewSlot: {
    fab: null
  }
  ViewEmit: {
    clickedPackItem: FlowPack
  }
}>

export type ServerModule = AppServerModule<{
  Deps: {
    FlowPackDb: IFlowPackDb
  }
  Model: ModelServer
  Msg: MsgServer
  MsgOutCmd: SpaceServerCmd<MsgToClient>
  MsgOutEvent: never
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
  Ctx: SpaceServerCtx
  MsgInCmd: never
  MsgInEvent: SpaceServerEvent
}>

//
//
//
//

export type ModelClient = {
  request: RequestResponse<string, null>
  packs: { [id: FlowPackId]: FlowPack }
}

export const initClient: ModelClient = {
  request: RemoteResult.notAsked,
  packs: {},
}

export const ModelServer = p.l(null)
export type ModelServer = p.Infer<typeof ModelServer>

export const initServer: ModelServer = null

export type MsgClient = { t: "user-observed-end-of-list" } | { t: "elapsed" }

export type MsgServer = { t: "noop" }

export type MsgToServer = {
  t: "list-packs"
  input: ListPackInput
}

export type MsgToClient = {
  t: "listed-packs"
  listed: ListPackOutput
}

export type ListPackInput = Parameters<IFlowPackDb["list"]>[0]

export type ListPackOutput = Awaited<ReturnType<IFlowPackDb["list"]>>
