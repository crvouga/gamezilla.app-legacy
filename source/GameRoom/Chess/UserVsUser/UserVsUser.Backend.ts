import { Cmd, exhaustive, Option, Sub, Time } from "../../../Core"
import { UserId } from "../../../Data"
import * as Board from "../Board"
import {
  BackendModel,
  BackendMsg,
  clockTicked,
  countDownElapsed,
  initShared,
  inputClock,
  inputPlayer,
  inputMove,
  newGame,
  requestToDraw,
  resign,
  respondToDraw,
  Res,
  startGame,
  ToBackend,
  ToFrontend,
  cancelStartGame,
  cancelDraw,
  initBackend,
} from "./UserVsUser.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = initBackend

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
    case "ClockTicked": {
      const modelNew: Model = {
        ...model,
        sharedModel: clockTicked(model.sharedModel),
      }

      const didChangeToGameOver =
        model.sharedModel.type !== "GameOver" &&
        modelNew.sharedModel.type === "GameOver"

      return [
        modelNew,
        Cmd.batch([
          sendToRoom(["ClockTicked", modelNew.sharedModel]),
          didChangeToGameOver ? sendToRoom(["GameOver"]) : Cmd.None,
        ]),
      ]
    }

    case "CountDownElapsed": {
      const modelNew: Model = {
        ...model,
        sharedModel: countDownElapsed(model.sharedModel),
      }

      const didChangeToGameStart =
        model.sharedModel.type !== "Game" &&
        modelNew.sharedModel.type === "Game"

      return [
        modelNew,
        Cmd.batch([
          sendToRoom(["CountDownElapsed_Done", modelNew.sharedModel]),
          didChangeToGameStart ? sendToRoom(["GameStarted"]) : Cmd.None,
        ]),
      ]
    }
  }
}

export const updateFromFrontend = (
  wire: {
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Init": {
      return [model, wire.sendToClient(["Sync", model.sharedModel])]
    }

    case "RequestToDraw": {
      return sendResponse(
        wire,
        ["RequestToDraw_Done", requestToDraw(msg[1], model.sharedModel)],
        model,
      )
    }

    case "Resign": {
      return sendResponse(
        wire,
        ["Resign_Done", resign(msg[1], model.sharedModel)],
        model,
      )
    }

    case "InputClock": {
      return sendResponse(
        wire,
        ["InputClock_Done", inputClock(msg[1], model.sharedModel)],
        model,
      )
    }

    case "InputPlayer": {
      return sendResponse(
        wire,
        ["InputPlayer_Done", inputPlayer(msg[1], model.sharedModel)],
        model,
      )
    }

    case "StartGame": {
      return sendResponse(
        wire,
        ["StartGame_Done", startGame(msg[1], model.sharedModel)],
        model,
      )
    }

    case "InputMove": {
      return sendResponse(
        wire,
        ["InputMove_Done", inputMove(msg[1], model.sharedModel)],
        model,
      )
    }

    case "RespondToDraw": {
      return sendResponse(
        wire,
        ["RespondToDraw_Done", respondToDraw(msg[1], model.sharedModel)],
        model,
      )
    }

    case "NewGame": {
      return sendResponse(
        wire,
        ["NewGame_Done", newGame(model.sharedModel)],
        model,
      )
    }

    case "CancelStartGame": {
      return sendResponse(
        wire,
        ["CancelStartGame_Done", cancelStartGame(msg[1], model.sharedModel), msg[1],],
        model,
      )
    }

    case 'CancelDraw': {
      return sendResponse(
        wire,
        ["CancelDraw_Done", cancelDraw(msg[1], model.sharedModel)],
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
  response: Res,
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

  const didChangeToGameOver =
    model.sharedModel.type !== "GameOver" &&
    modelNew.sharedModel.type === "GameOver"

  return [
    modelNew,
    Cmd.batch([
      didChangeToGameOver ? sendToRoom(["GameOver"]) : Cmd.None,
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

    case "Starting": {
      return Time.every(`${intervalId}-count-down`, (3 / 4) * 1000, () => [
        "CountDownElapsed",
      ])
    }

    case "Game": {
      const turn = Board.toTurn(model.sharedModel.board)

      switch (turn) {
        case "b": {
          return Time.every(`${intervalId}-b`, 1000, () => ["ClockTicked"])
        }
        case "w": {
          return Time.every(`${intervalId}-w`, 1000, () => ["ClockTicked"])
        }
      }
    }
  }
}
