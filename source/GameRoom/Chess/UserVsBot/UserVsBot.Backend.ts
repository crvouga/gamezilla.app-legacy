import { Cmd, exhaustive, Option, pipe, Sub } from "../../../Core"
import { UserId } from "../../../Data"
import * as Board from '../Board'
import {
  BackendModel,
  BackendMsg,
  initShared,
  inputBot,
  inputColor,
  inputUser,
  isBotTurn,
  inputMove,
  Res,
  startGame,
  stopGame,
  ToBackend,
  ToFrontend,
  botMoved,
} from "./UserVsBot.Types"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = ({
  userId,
}: {
  userId: Option.Option<UserId.UserId>
}): Model => {
  return {
    type: "Setup",
    botDifficulty: initShared.botDifficulty,
    userColor: initShared.userColor,
    userId,
  }
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

const toBotMoveCmd = (model: Model, modelNew: Model): Cmd.Cmd<Msg> => {
  if (model.type !== 'Game') {
    return Cmd.None
  }

  const didChangeToBotTurn = !isBotTurn(model) && isBotTurn(modelNew)

  if (!didChangeToBotTurn) {
    return Cmd.None
  }

  const legalMoveInputs = Board.toLegalMoveInputs(model.board)

  const randomMoveInput = legalMoveInputs[Math.floor(Math.random() * legalMoveInputs.length)]

  if (!randomMoveInput) {
    return Cmd.None
  }

  return Cmd.of(['BotMoved', randomMoveInput])
}

export const updateFromFrontend_ = (
  {
    sendToClient,
    sendToRoom,
  }: Wire,
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

    case 'InputMove': {
      const result = inputMove(msg[1], model)

      const modelNew = result.type === "Err" ? model : result.value

      return [modelNew, sendToRoom(["InputMove_Done", result])]
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
): Sub.Sub<Msg> => {
  return Sub.None
}
