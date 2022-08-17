import { Cmd, Sub } from "../../Core"
import { ClientId, RoomId } from "../../Data"
import {
  BackendModel,
  BackendMsg,
  initSharedModel,
  move,
  playAs,
  startGame,
  ToBackend,
  ToFrontend,
} from "./Chess.Types"
import * as Bridge from "../../Bridge"
import * as ChessTs from "chess.ts"

//
//
//
// ModelØ
//
//
//

export type Model = BackendModel

export const init: Model = initSharedModel

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (msg: Msg, model: Model): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "None": {
      return [model, Cmd.None]
    }
  }
}

export const updateFromFrontend = (
  { clientId, roomId }: { roomId: RoomId.RoomId; clientId: ClientId.ClientId },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "PlayAs": {
      const result = playAs(msg[1], model)

      const toFrontend = sendToFrontend([clientId], roomId, [
        "PlayAsResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew: Model = { ...model, ...result.value }

      return [
        modelNew,
        Cmd.batch([toFrontend, broadcast(roomId, ["Sync", modelNew])]),
      ]
    }

    case "StartGame": {
      const result = startGame(model)

      const toFrontend = sendToFrontend([clientId], roomId, [
        "StartGameResulted",
        result,
      ])

      if (result.type === "Err") {
        return [model, toFrontend]
      }

      const modelNew: Model = { ...model, ...result.value }

      return [
        modelNew,
        Cmd.batch([toFrontend, broadcast(roomId, ["Sync", modelNew])]),
      ]
    }

    case "Move": {
      const result = move(msg[1], model)

      if (result.type === "Err") {
        return [model, sendToFrontend([clientId], roomId, ["Sync", model])]
      }

      const modelNew: Model = { ...model, ...result.value }

      return [modelNew, broadcast(roomId, ["Sync", modelNew])]
    }
  }
}

//
//
//
// Bridge
//
//
//

export const sendToFrontend = (
  clientIds: ClientId.ClientId[],
  roomId: RoomId.RoomId,
  msg: ToFrontend,
) => {
  return Bridge.sendToFrontend(clientIds, [
    "GameRoom",
    ["Games", roomId, ["Chess", msg]],
  ])
}

export const broadcast = (roomId: RoomId.RoomId, msg: ToFrontend) => {
  return Bridge.broadcast(["GameRoom", ["Games", roomId, ["Chess", msg]]])
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([])
}
