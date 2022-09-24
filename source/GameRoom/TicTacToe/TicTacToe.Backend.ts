import { Cmd, exhaustive, Sub, Time } from "../../Core"
import { toTurn } from "./TicTacToe"
import {
  BackendModel,
  BackendMsg,
  roundCountDown,
  initSharedModel,
  inputBestOutOf,
  inputMove,
  inputMoveTimeLimit,
  inputPlayer,
  newGame,
  resign,
  startGame,
  stopPlaying,
  ToBackend,
  ToFrontend,
  moveCountDown,
  toCurrentRound
} from "./TicTacToe.Types"

//
//
//
// ModelØ
//
//
//

export type Model = BackendModel

export const init = initSharedModel

//
//
//
// Update
//
//
//

export type Msg = BackendMsg

export const update = ({
  sendToRoom,
}: {
  sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
},
  msg: Msg,
  model: Model
): [Model, Cmd.Cmd<Msg>] => {

  switch (msg[0]) {
    case "RoundCountDown": {
      const result = roundCountDown(model)

      const modelNew = result.type === 'Err' ? model : result.value

      return [modelNew, sendToRoom(['RoundCountDown_Done', result])]
    }

    case 'MoveCountDown': {
      const result = moveCountDown(model)

      const modelNew = result.type === 'Err' ? model : result.value

      return [modelNew, sendToRoom(['MoveCountDown_Done', result])]
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
    case "InputPlayer": {
      const result = inputPlayer(msg[1], model)

      if (result.type === "Err") {
        return [model, sendToClient(["InputPlayer_Done", result])]
      }

      const modelNew = result.value

      return [modelNew, sendToRoom(["InputPlayer_Done", result])]
    }

    case "StopPlaying": {
      const result = stopPlaying(msg[1], model)

      if (result.type === "Err") {
        return [model, sendToClient(["StopPlaying_Done", result])]
      }

      const modelNew = result.value

      return [modelNew, sendToRoom(["StopPlaying_Done", result])]
    }

    case "StartGame": {
      const result = startGame(msg[1], model)

      if (result.type === "Err") {
        return [model, sendToClient(["StartGame_Done", result])]
      }

      const modelNew = result.value

      return [modelNew, sendToRoom(["StartGame_Done", result])]
    }

    case "Resign": {
      const result = resign(msg[1], model)

      if (result.type === "Err") {
        return [model, sendToClient(["Resign_Done", result])]
      }

      const modelNew = result.value

      return [modelNew, sendToRoom(["Resign_Done", result])]
    }

    case "InputMove": {
      const result = inputMove(msg[1], model)

      if (result.type === "Err") {
        return [model, sendToClient(["InputMove_Done", result])]
      }

      const modelNew = result.value

      return [modelNew, sendToRoom(["InputMove_Done", result])]
    }

    case 'NewGame': {
      const result = newGame(msg[1], model)

      if (result.type === "Err") {
        return [model, sendToClient(["NewGame_Done", result])]
      }

      const modelNew = result.value

      return [modelNew, sendToRoom(["NewGame_Done", result])]
    }

    case 'InputBestOutOf': {
      const result = inputBestOutOf(msg[1], model)

      if (result.type === "Err") {
        return [model, sendToClient(["InputBestOutOf_Done", result])]
      }

      const modelNew = result.value

      return [modelNew, sendToRoom(["InputBestOutOf_Done", result])]
    }

    case 'InputMoveTimeLimit': {
      const result = inputMoveTimeLimit(msg[1], model)

      if (result.type === "Err") {
        return [model, sendToClient(["InputMoveTimeLimit_Done", result])]
      }

      const modelNew = result.value

      return [modelNew, sendToRoom(["InputMoveTimeLimit_Done", result])]
    }

    default: {
      return exhaustive(msg[0])
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

export const subscriptions = (intervalId: string, model: Model): Sub.Sub<Msg> => {
  switch (model.type) {
    case 'Setup': {
      return Sub.None
    }

    case 'GameOver': {
      return Sub.None
    }


    case 'Game': {

      const currentRound = toCurrentRound(model.round)

      switch (currentRound.type) {
        case 'Started': {
          const turn = toTurn(currentRound.board)
          return Time.every(`${intervalId}-move-count-down-${turn}`, 1000, (): Msg => ['MoveCountDown'])
        }

        case 'Starting': {
          return Time.every(`${intervalId}-round-count-down`, 750, (): Msg => ['RoundCountDown'])
        }

        case 'RoundOver': {
          return Sub.None
        }
      }
    }
  }
}
