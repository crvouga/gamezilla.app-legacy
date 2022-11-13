import { Cmd, exhaustive, Sub, Time } from "../../../Core"
import { UserId } from "../../../Data"
import * as Board from "../Board"
import {
  initShared,
  BackendModel,
  BackendMsg, cancelDraw, cancelStartGame, clockTicked,
  countDownElapsed, inputClock, inputMove, inputPlayer, newGame,
  requestToDraw, Res, resign,
  respondToDraw, startGame,
  ToBackend,
  ToFrontend
} from "./UserVsUser.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = initShared
//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = (
  { sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "ClockTicked": {
      const modelNew: Model = {
        ...model,
        ...clockTicked(model),
      }

      const didChangeToGameOver =
        model.type !== "GameOver" &&
        modelNew.type === "GameOver"

      return [
        modelNew,
        Cmd.batch([
          sendToRoom(["ClockTicked", modelNew]),
          didChangeToGameOver ? sendToRoom(["GameOver"]) : Cmd.None,
        ]),
      ]
    }

    case "CountDownElapsed": {
      const modelNew: Model = {
        ...model,
        ...countDownElapsed(model),
      }

      const didChangeToGameStart =
        model.type !== "Game" &&
        modelNew.type === "Game"

      return [
        modelNew,
        Cmd.batch([
          sendToRoom(["CountDownElapsed_Done", modelNew]),
          didChangeToGameStart ? sendToRoom(["GameStarted"]) : Cmd.None,
        ]),
      ]
    }
  }
}

export const updateFromFrontend = (
  wire: {
    sendToClient: (msg: ToFrontend) => Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "Init": {
      return [model, wire.sendToClient(["Sync", model])]
    }

    case "RequestToDraw": {
      return sendResponse(
        wire,
        ["RequestToDraw_Done", requestToDraw(msg[1], model)],
        model,
      )
    }

    case "Resign": {
      return sendResponse(
        wire,
        ["Resign_Done", resign(msg[1], model)],
        model,
      )
    }

    case "InputClock": {
      return sendResponse(
        wire,
        ["InputClock_Done", inputClock(msg[1], model)],
        model,
      )
    }

    case "InputPlayer": {
      return sendResponse(
        wire,
        ["InputPlayer_Done", inputPlayer(msg[1], model)],
        model,
      )
    }

    case "StartGame": {
      return sendResponse(
        wire,
        ["StartGame_Done", startGame(msg[1], model)],
        model,
      )
    }

    case "InputMove": {
      return sendResponse(
        wire,
        ["InputMove_Done", inputMove(msg[1], model)],
        model,
      )
    }

    case "RespondToDraw": {
      return sendResponse(
        wire,
        ["RespondToDraw_Done", respondToDraw(msg[1], model)],
        model,
      )
    }

    case "NewGame": {
      return sendResponse(
        wire,
        ["NewGame_Done", newGame(model)],
        model,
      )
    }

    case "CancelStartGame": {
      return sendResponse(
        wire,
        [
          "CancelStartGame_Done",
          cancelStartGame(msg[1], model),
          msg[1],
        ],
        model,
      )
    }

    case "CancelDraw": {
      return sendResponse(
        wire,
        ["CancelDraw_Done", cancelDraw(msg[1], model)],
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
    sendToClient: (msg: ToFrontend) => Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd<never>
  },
  response: Res,
  model: Model,
): [Model, Cmd<Msg>] => {
  if (response[1].type === "Err") {
    return [
      model,
      Cmd.batch([
        sendToClient(response),
        sendToClient(["Sync", model]),
      ]),
    ]
  }

  const modelNew: Model = response[1].value

  const didChangeToGameOver =
    model.type !== "GameOver" &&
    modelNew.type === "GameOver"

  return [
    modelNew,
    Cmd.batch([
      didChangeToGameOver ? sendToRoom(["GameOver"]) : Cmd.None,
      sendToRoom(response),
    ]),
  ]
}


export const updateRoomLeave = ({ sendToRoom }: { sendToRoom: (m: ToFrontend) => Cmd<never> }, userId: UserId.UserId, model: Model): [Model, Cmd<Msg>] => {

  switch (model.type) {
    case 'Setup': {
      const color: Board.Color | 'None' = model.b === userId ? 'b' : model.w === userId ? 'w' : 'None'

      if (color === 'None') {
        return [model, Cmd.None]
      }

      const modelNew: Model = { ...model, [color]: "None" }

      return [modelNew, sendToRoom(['PlayerLeft', modelNew])]
    }

    case 'Game':
    case 'GameOver':
    case 'Starting': {
      const color: Board.Color | 'None' = model.b === userId ? 'b' : model.w === userId ? 'w' : 'None'

      if (color === 'None') {
        return [model, Cmd.None]
      }

      const otherColor = Board.toOppositeColor(color)

      const modelNew: Model = {
        ...model,
        type: "Setup",
        clockPreset: model.clock.preset,
        [otherColor]: model[otherColor],
        [color]: "None",
      }

      return [modelNew, sendToRoom(['PlayerLeft', modelNew])]
    }
  }


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
): Sub<Msg> => {
  switch (model.type) {
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
      const turn = Board.toTurn(model.board)

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
