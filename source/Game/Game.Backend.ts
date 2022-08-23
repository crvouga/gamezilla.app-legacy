import { Cmd, Sub, tagCmd, tagSub, tagUpdate } from "../Core"
import { ClientId, RoomId } from "../Data"
import * as Chess from "./Chess/Chess.Backend"
import * as ConnectFour from "./ConnectFour/ConnectFour.Backend"
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Game.Types"
import * as Snake from "./Snake/Snake.Backend"
import * as TicTacToe from "./TicTacToe/TicTacToe.Backend"

//
//
//
// Model
//
//
//

export type Model = BackendModel

export const init = ({ gameName }: { gameName: Model[0] }): Model => {
  switch (gameName) {
    case "ConnectFour": {
      return ["ConnectFour", ConnectFour.init]
    }

    case "Snake": {
      return ["Snake", Snake.init]
    }

    case "TicTacToe": {
      return ["TicTacToe", TicTacToe.init]
    }

    case "Chess": {
      return ["Chess", Chess.init]
    }
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
  {
    broadcast,
    roomId,
  }: {
    broadcast: (toFrontend: ToFrontend) => Cmd.Cmd<never>
    roomId: RoomId.RoomId
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ConnectFour": {
      if (model[0] === "ConnectFour") {
        return tagUpdate("ConnectFour", ConnectFour.update(msg[1], model[1]))
      }
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (model[0] === "TicTacToe") {
        return tagUpdate("TicTacToe", TicTacToe.update(msg[1], model[1]))
      }
      return [model, Cmd.None]
    }

    case "Snake": {
      if (model[0] === "Snake") {
        return tagUpdate("Snake", Snake.update({ roomId }, msg[1], model[1]))
      }
      return [model, Cmd.None]
    }

    case "Chess": {
      if (model[0] === "Chess") {
        return tagUpdate(
          "Chess",
          Chess.update(
            { broadcast: (msg) => broadcast(["Chess", msg]) },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }
  }
}

export const updateFromFrontend = (
  { clientId, roomId }: { roomId: RoomId.RoomId; clientId: ClientId.ClientId },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "ConnectFour": {
      if (model[0] === "ConnectFour") {
        return tagUpdate(
          "ConnectFour",
          ConnectFour.updateFromFrontend(clientId, msg[1], model[1]),
        )
      }
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (model[0] === "TicTacToe") {
        return tagUpdate(
          "TicTacToe",
          TicTacToe.updateFromFrontend(clientId, msg[1], model[1]),
        )
      }
      return [model, Cmd.None]
    }

    case "Snake": {
      if (model[0] === "Snake") {
        return tagUpdate(
          "Snake",
          Snake.updateFromFrontend({ clientId, roomId }, msg[1], model[1]),
        )
      }
      return [model, Cmd.None]
    }

    case "Chess": {
      if (model[0] === "Chess") {
        return tagUpdate(
          "Chess",
          Chess.updateFromFrontend({ clientId, roomId }, msg[1], model[1]),
        )
      }
      return [model, Cmd.None]
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
  roomId: RoomId.RoomId,
  model: Model,
): Sub.Sub<Msg> => {
  switch (model[0]) {
    case "ConnectFour": {
      return tagSub("ConnectFour", ConnectFour.subscriptions(model[1]))
    }
    case "TicTacToe": {
      return tagSub("TicTacToe", TicTacToe.subscriptions(model[1]))
    }
    case "Snake": {
      return tagSub("Snake", Snake.subscriptions(roomId, model[1]))
    }
    case "Chess": {
      return tagSub("Chess", Chess.subscriptions(roomId, model[1]))
    }
  }
}
