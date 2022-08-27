import * as Bridge from "../../../Bridge"
import { Cmd, exhaustive, Sub, Time } from "../../../Core"
import { ClientId, RoomId } from "../../../Data"
import * as Board from "../Board"
import {
  BackendModel,
  BackendMsg,
  clockTicked,
  initShared,
  inputClock,
  inputPlayer,
  move,
  newGame,
  requestToDraw,
  resign,
  respondToDraw,
  Response,
  startGame,
  ToBackend,
  ToFrontend,
} from "./UserVsUser.Shared"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init: Model = {
  sharedModel: initShared,
}

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
      const modelNew = clockTicked(model.sharedModel)

      return [
        { ...model, sharedModel: modelNew },
        broadcast(["Sync", modelNew]),
      ]
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
      return [
        model,
        sendToFrontend([clientId], roomId, ["Sync", model.sharedModel]),
      ]
    }

    case "RequestToDraw": {
      return sendResponse(
        { clientId, roomId },
        ["RequestToDrawResulted", requestToDraw(msg[1], model.sharedModel)],
        model,
      )
    }

    case "Resign": {
      return sendResponse(
        { clientId, roomId },
        ["ResignResulted", resign(msg[1], model.sharedModel)],
        model,
      )
    }

    case "InputClock": {
      return sendResponse(
        { clientId, roomId },
        ["InputClockResulted", inputClock(msg[1], model.sharedModel)],
        model,
      )
    }

    case "InputPlayer": {
      return sendResponse(
        { clientId, roomId },
        ["InputPlayerResulted", inputPlayer(msg[1], model.sharedModel)],
        model,
      )
    }

    case "StartGame": {
      return sendResponse(
        { clientId, roomId },
        ["StartGameResulted", startGame(model.sharedModel)],
        model,
      )
    }

    case "Move": {
      return sendResponse(
        { clientId, roomId },
        ["MovedResulted", move(msg[1], model.sharedModel)],
        model,
      )
    }

    case "RespondToDraw": {
      return sendResponse(
        { clientId, roomId },
        ["RespondToDrawResulted", respondToDraw(msg[1], model.sharedModel)],
        model,
      )
    }

    case "NewGame": {
      return sendResponse(
        { clientId, roomId },
        ["NewGameResulted", newGame(model.sharedModel)],
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
  if (response[1].type === "Err") {
    return [
      model,
      Cmd.batch([
        sendToFrontend([clientId], roomId, response),
        sendToFrontend([clientId], roomId, ["Sync", model.sharedModel]),
      ]),
    ]
  }

  const modelNew: Model = {
    sharedModel: response[1].value,
  }

  return [
    modelNew,
    Cmd.batch([
      broadcast(roomId, response),
      broadcast(roomId, ["Sync", modelNew.sharedModel]),
    ]),
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
    ["Games", roomId, ["Chess", ["UserVsUser", msg]]],
  ])
}

type Broadcast = (toFrontend: ToFrontend) => Cmd.Cmd<never>

export const broadcast = (roomId: RoomId.RoomId, msg: ToFrontend) => {
  return Bridge.broadcast([
    "GameRoom",
    ["Games", roomId, ["Chess", ["UserVsUser", msg]]],
  ])
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
  switch (model.sharedModel.type) {
    case "Setup": {
      return Sub.None
    }
    case "Game": {
      const turn = Board.toTurn(model.sharedModel.board)

      switch (turn) {
        case "b": {
          return Time.every(`b-${intervalId}`, 1000, () => ["Tick"])
        }
        case "w": {
          return Time.every(`w-${intervalId}`, 1000, () => ["Tick"])
        }
      }
    }
  }
}
