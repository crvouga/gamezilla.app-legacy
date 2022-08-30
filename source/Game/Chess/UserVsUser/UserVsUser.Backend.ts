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
  { sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Tick": {
      const modelNew = clockTicked(model.sharedModel)

      return [
        { ...model, sharedModel: modelNew },
        sendToRoom(["Sync", modelNew]),
      ]
    }
  }
}

export const updateFromFrontend = (
  {
    sendToClient,
    sendToRoom,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Init": {
      return [model, sendToClient(["Sync", model.sharedModel])]
    }

    case "RequestToDraw": {
      return sendResponse(
        { sendToClient, sendToRoom },
        ["RequestToDrawResulted", requestToDraw(msg[1], model.sharedModel)],
        model,
      )
    }

    case "Resign": {
      return sendResponse(
        { sendToClient, sendToRoom },
        ["ResignResulted", resign(msg[1], model.sharedModel)],
        model,
      )
    }

    case "InputClock": {
      return sendResponse(
        { sendToClient, sendToRoom },
        ["InputClockResulted", inputClock(msg[1], model.sharedModel)],
        model,
      )
    }

    case "InputPlayer": {
      return sendResponse(
        { sendToClient, sendToRoom },
        ["InputPlayerResulted", inputPlayer(msg[1], model.sharedModel)],
        model,
      )
    }

    case "StartGame": {
      return sendResponse(
        { sendToClient, sendToRoom },
        ["StartGameResulted", startGame(model.sharedModel)],
        model,
      )
    }

    case "Move": {
      return sendResponse(
        { sendToClient, sendToRoom },
        ["MovedResulted", move(msg[1], model.sharedModel)],
        model,
      )
    }

    case "RespondToDraw": {
      return sendResponse(
        { sendToClient, sendToRoom },
        ["RespondToDrawResulted", respondToDraw(msg[1], model.sharedModel)],
        model,
      )
    }

    case "NewGame": {
      return sendResponse(
        { sendToClient, sendToRoom },
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
  {
    sendToClient,
    sendToRoom,
  }: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  response: Response,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  if (response[1].type === "Err") {
    return [
      model,
      Cmd.batch([
        sendToClient(response),
        sendToClient(["Sync", model.sharedModel]),
      ]),
    ]
  }

  const modelNew: Model = {
    sharedModel: response[1].value,
  }

  return [
    modelNew,
    Cmd.batch([
      sendToRoom(response),
      sendToRoom(["Sync", modelNew.sharedModel]),
    ]),
  ]
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

    case "GameOver": {
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
