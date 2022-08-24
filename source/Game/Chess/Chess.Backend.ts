import * as Bridge from "../../Bridge"
import { Cmd, exhaustive, Sub, Time } from "../../Core"
import { ClientId, RoomId } from "../../Data"
import * as Board from "./Board"
import {
  askToDraw,
  BackendModel,
  BackendMsg,
  decrementClock,
  initSharedModel,
  inputClock,
  inputPlayer,
  move,
  resign,
  respondToDraw,
  Response,
  startGame,
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

    case "AskToDraw": {
      return sendResponse(
        { clientId, roomId },
        ["AskToDrawResulted", askToDraw(msg[1], model)],
        model,
      )
    }

    case "Resign": {
      return sendResponse(
        { clientId, roomId },
        ["ResignResulted", resign(msg[1], model)],
        model,
      )
    }

    case "InputClock": {
      return sendResponse(
        { clientId, roomId },
        ["InputClockResulted", inputClock(msg[1], model)],
        model,
      )
    }

    case "InputPlayer": {
      return sendResponse(
        { clientId, roomId },
        ["InputPlayerResulted", inputPlayer(msg[1], model)],
        model,
      )
    }

    case "StartGame": {
      return sendResponse(
        { clientId, roomId },
        ["StartGameResulted", startGame(model)],
        model,
      )
    }

    case "Move": {
      return sendResponse(
        { clientId, roomId },
        ["MovedResulted", move(msg[1], model)],
        model,
      )
    }

    case "RespondToDraw": {
      return sendResponse(
        { clientId, roomId },
        ["RespondToDrawResulted", respondToDraw(msg[1], model)],
        model,
      )
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

const sendResponse = (
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
  if (model.type !== "GameStarted") {
    return Sub.None
  }

  const turn = Board.toTurn(model.board)

  switch (turn) {
    case "b": {
      return Time.every(`b-${intervalId}`, 1000, () => ["Tick"])
    }
    case "w": {
      return Time.every(`w-${intervalId}`, 1000, () => ["Tick"])
    }
  }
}
