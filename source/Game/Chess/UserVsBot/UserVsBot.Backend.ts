import { Cmd, p, Sub } from "../../../Core"
import { UserId } from "../../../Data/UserId"
import * as Board from "../Board"
import {
  BackendModel,
  BackendMsg,
  botMoved, initBackend, inputBot,
  inputColor,
  inputMove,
  inputUser,
  isBotTurn,
  startGame,
  stopGame,
  ToBackend,
  ToFrontend
} from "./UserVsBot.Types"

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
    case "BotMoved": {
      const result = botMoved(msg[1], model)

      const modelNew = result.type === "Err" ? model : result.value

      return [modelNew, sendToRoom(["BotMoved_Done", result])]
    }
  }
}

type Wire = {
  sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
  sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
}

export const updateFromFrontend = (
  wire: Wire,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  const [modelNew, cmd] = updateFromFrontend_(wire, msg, model)

  return [modelNew, Cmd.batch([cmd, toBotMoveCmd(model, modelNew)])]
}

const toBotMoveCmd = (modelPrev: Model, modelNext: Model): Cmd.Cmd<Msg> => {
  const didChangeToBotTurn = !isBotTurn(modelPrev) && isBotTurn(modelNext)

  if (!didChangeToBotTurn) {
    return Cmd.None
  }
  if (modelNext.type !== "Game") {
    return Cmd.None
  }

  const cmd = p(
    Board.getBestMove(modelNext.botLevel, modelNext.board),
    Cmd.perform((result): Msg => ["BotMoved", result]),
  )

  return cmd
}

const updateFromFrontend_ = (
  { sendToClient, sendToRoom }: Wire,
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Init": {
      return [model, sendToClient(["Sync", model])]
    }

    case "StartGame": {
      const result = startGame(msg[1], model)

      const modelNew = result.type === "Err" ? model : result.value

      return [modelNew, sendToRoom(["StartGame_Done", result])]
    }

    case "StopGame": {
      const result = stopGame(msg[1], model)

      const modelNew = result.type === "Err" ? model : result.value

      return [modelNew, sendToRoom(["StopGame_Done", result])]
    }

    case "InputUser": {
      const result = inputUser(msg[1], model)

      const modelNew = result.type === "Err" ? model : result.value

      return [modelNew, sendToRoom(["InputUser_Done", result])]
    }

    case "InputColor": {
      const result = inputColor(msg[1], model)

      const modelNew = result.type === "Err" ? model : result.value

      return [modelNew, sendToRoom(["InputColor_Done", result])]
    }

    case "InputBot": {
      const result = inputBot(msg[1], model)

      const modelNew = result.type === "Err" ? model : result.value

      return [modelNew, sendToRoom(["InputBot_Done", result])]
    }

    case "InputMove": {
      const result = inputMove(msg[1], model)

      const modelNew = result.type === "Err" ? model : result.value

      return [modelNew, sendToRoom(["InputMove_Done", result])]
    }
  }
}

export const updateRoomLeave = ({ sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> }, userId: UserId, model: Model): [Model, Cmd.Cmd<Msg>] => {
  if (model.userId === userId) {
    const modelNew: Model = {
      type: "Setup",
      botLevel: model.botLevel,
      userColor: model.userColor,
      userId: "None"
    }
    return [modelNew, sendToRoom(['PlayerLeft', modelNew])]
  }

  return [model, Cmd.None]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  _intervalId: string,
  _model: Model,
): Sub.Sub<Msg> => {
  return Sub.None
}
