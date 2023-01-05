import { Cmd, p, Sub } from "../../../Core"
import {
  isBotTurn,
  initShared,
  BackendMsg,
  BackendModel,
  ToBackend,
  handle,
  Res,
  ToFrontend,
  botMove,
} from "./vs-bot.types"
import { UserId } from "../../../Data/UserId"
import { getBestMove, opposite } from "../connect-four/connect-four"

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
  { broadcast }: { broadcast: (m: ToFrontend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "bot-move": {
      const result = botMove(msg[1], model)
      if (result.type === "Err") {
        return [model, broadcast(["bot-move", result])]
      }
      return [result.value, broadcast(["bot-move", result])]
    }
  }
}

export const updateFromFrontend = (
  wire: {
    broadcast: (msg: ToFrontend) => Cmd
    sendToClient: (msg: ToFrontend) => Cmd
  },
  msg: ToBackend,
  modelPrev: Model,
): [Model, Cmd<Msg>] => {
  const [modelNext, cmd] = updateFromFrontend_(wire, msg, modelPrev)

  if (
    !isBotTurn(modelPrev) &&
    isBotTurn(modelNext) &&
    modelNext.type === "Game"
  ) {
    return [
      modelNext,
      Cmd.batch([
        cmd,
        p(
          getBestMove({
            columns: modelNext.columns,
            maximizingPlayer: opposite[modelNext.userPlayerType],
          }),
          Cmd.perform((result) => ["bot-move", result]),
        ),
      ]),
    ]
  }

  return [modelNext, cmd]
}

const updateFromFrontend_ = (
  {
    broadcast,
    sendToClient,
  }: {
    broadcast: (msg: ToFrontend) => Cmd
    sendToClient: (msg: ToFrontend) => Cmd
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case 'restart':
    case 'start-game':
    case "start-playing":
    case 'stop-game':
    case "stop-playing":
    case 'swap-sides':
    case "input-player-type":
    case 'input-move':
    case 'input-bot-level': {
      const res: Res = [msg[0], handle(msg, model)]

      if (res[1].type === "Err") {
        return [model, sendToClient(res)]
      }

      return [res[1].value, broadcast(res)]
    }
  }
}

export const updateRoomLeave = ({
  userId,
  model,
  broadcast,
}: {
  broadcast: (m: ToFrontend) => Cmd
  userId: UserId
  model: Model
}): [Model, Cmd<Msg>] => {
  if (model.player !== userId) {
    return [model, Cmd.None]
  }

  const modelNew: Model = {
    type: "Setup",
    botLevel: model.botLevel,
    userPlayerType: model.userPlayerType,
    player: "none",
  }

  return [modelNew, broadcast(["player-left", modelNew])]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None
}
