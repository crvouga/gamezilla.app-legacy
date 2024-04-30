import { GameServer } from "gamezilla-app/app/@CHILD/spaces/@SHARED/architecture/game-server"
import { Sub } from "gamezilla-app/@SHARED/core"
import {
  MsgSync,
  ModelSync,
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
} from "./chess.core"

//
//
//
//
//
//
//

type Server = GameServer<{
  MsgSync: MsgSync
  ModelSync: ModelSync
  ModelServer: ModelServer
  MsgServer: MsgServer
  MsgToClient: MsgToClient
  MsgToServer: MsgToServer
}>

//
//
//
// Model
//
//
//

export const init: Server["init"] = async (input) => {
  if (input.model) {
    return { model: input.model }
  }
  return {
    model: { t: "none" },
  }
}

//
//
//
// Update
//
//
//

export const update: Server["update"] = async (_input) => {
  return {
    model: {
      t: "none",
    },
  }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions: Server["subscriptions"] = async (_input) => {
  return Sub.None
}
