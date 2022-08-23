import * as Bridge from "../../Bridge"
import { Cmd, Sub, Time } from "../../Core"
import { ClientId, RoomId } from "../../Data"
import * as Board from "./Board"
import {
  BackendModel,
  BackendMsg,
  decrementClock,
  initSharedModel,
  inputClock,
  move,
  playAs,
  Response,
  startGame,
  stopPlaying,
  ToBackend,
  ToFrontend,
} from "./Chess.Types"

//
//
//
// Model
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

export const update = (
  { broadcast }: { broadcast: Broadcast },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Tick": {
      if (model.type !== "GameStarted") {
        return [model, Cmd.None]
      }

      const turn = Board.toTurn(model.board)

      const modelNew: Model = {
        ...model,
        clock: decrementClock(turn, model.clock),
      }

      return [modelNew, broadcast(["Sync", model])]
    }
  }
}

export const updateFromFrontend = (
  { clientId, roomId }: { roomId: RoomId.RoomId; clientId: ClientId.ClientId },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Init": {
      return [model, sendToFrontend([clientId], roomId, ["Sync", model])]
    }

    case "InputClock": {
      return handleResponse(
        { clientId, roomId },
        ["InputtedClock", inputClock(msg[1], model)],
        model,
      )
    }

    case "PlayAs": {
      return handleResponse(
        { clientId, roomId },
        ["PlayAsResulted", playAs(msg[1], model)],
        model,
      )
    }

    case "StopPlaying": {
      return handleResponse(
        { clientId, roomId },
        ["StopPlayingResulted", stopPlaying(msg[1], model)],
        model,
      )
    }

    case "StartGame": {
      return handleResponse(
        { clientId, roomId },
        ["StartGameResulted", startGame(model)],
        model,
      )
    }

    case "Move": {
      return handleResponse(
        { clientId, roomId },
        ["MovedResulted", move(msg[1], model)],
        model,
      )
    }
  }
}

const handleResponse = (
  { clientId, roomId }: { clientId: ClientId.ClientId; roomId: RoomId.RoomId },
  response: Response,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const toFrontend = sendToFrontend([clientId], roomId, response)

  if (response[1].type === "Err") {
    return [model, toFrontend]
  }

  const modelNew: Model = { ...model, ...response[1].value }

  return [
    modelNew,
    Cmd.batch([toFrontend, broadcast(roomId, ["Sync", modelNew])]),
  ]
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

type Broadcast = (toFrontend: ToFrontend) => Cmd.Cmd<never>

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

export const subscriptions = (
  intervalId: string,
  model: Model,
): Sub.Sub<Msg> => {
  return Sub.batch<Msg>([Time.every(intervalId, 1000, () => ["Tick"])])
}
