import { Cmd, Sub, tagCmd, tagSub, tagUpdate } from "../Core"
import { UserId } from "../Data"
import * as Chess from "./Chess/Chess.Backend"
import * as ConnectFour from "./ConnectFour/ConnectFour.Backend"
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Game.Types"
import * as Snake from "./Snake/Snake.Backend"
import * as Tetris from "./Tetris/Tetris.Backend"
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

    case "Tetris": {
      return ["Tetris", Tetris.init]
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
    sendToRoom,
  }: {
    sendToRoom: (toFrontend: ToFrontend) => Cmd.Cmd<never>
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Tetris": {
      if (model[0] === "Tetris") {
        return tagUpdate(
          "Tetris",
          Tetris.update(
            { sendToRoom: (msg) => sendToRoom(["Tetris", msg]) },
            msg[1],
            model[1],
          ),
        )
      }

      return [model, Cmd.None]
    }

    case "ConnectFour": {
      if (model[0] === "ConnectFour") {
        return tagUpdate("ConnectFour",
          ConnectFour.update(
            { sendToRoom: msg => sendToRoom(['ConnectFour', msg]) },
            msg[1],
            model[1]
          )
        )
      }
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (model[0] === "TicTacToe") {
        return tagUpdate(
          "TicTacToe",
          TicTacToe.update(
            { sendToRoom: (msg) => sendToRoom(["TicTacToe", msg]) },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }

    case "Snake": {
      if (model[0] === "Snake") {
        return tagUpdate(
          "Snake",
          Snake.update(
            { sendToRoom: (msg) => sendToRoom(["Snake", msg]) },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }

    case "Chess": {
      if (model[0] === "Chess") {
        return tagUpdate(
          "Chess",
          Chess.update(
            { sendToRoom: (msg) => sendToRoom(["Chess", msg]) },
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
  {
    hostId,
    sendToClient,
    sendToRoom,
  }: {
    hostId: UserId.UserId
    sendToClient: (msg: ToFrontend) => Cmd.Cmd<never>
    sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never>
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "Tetris": {
      if (model[0] === "Tetris") {
        return tagUpdate(
          "Tetris",
          Tetris.updateFromFrontend(
            {
              sendToClient: (msg) => sendToClient(["Tetris", msg]),
              sendToRoom: (msg) => sendToRoom(["Tetris", msg]),
            },
            msg[1],
            model[1],
          ),
        )
      }

      return [model, Cmd.None]
    }

    case "ConnectFour": {
      if (model[0] === "ConnectFour") {
        return tagUpdate(
          "ConnectFour",
          ConnectFour.updateFromFrontend(
            {
              sendToClient: (msg) => sendToClient(["ConnectFour", msg]),
              sendToRoom: msg => sendToRoom(['ConnectFour', msg])
            },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (model[0] === "TicTacToe") {
        return tagUpdate(
          "TicTacToe",
          TicTacToe.updateFromFrontend(
            {
              sendToClient: (msg) => sendToClient(["TicTacToe", msg]),
              sendToRoom: (msg) => sendToRoom(["TicTacToe", msg]),
            },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }

    case "Snake": {
      if (model[0] === "Snake") {
        return tagUpdate(
          "Snake",
          Snake.updateFromFrontend(
            {
              sendToClient: (msg) => sendToClient(["Snake", msg]),
              sendToRoom: (msg) => sendToRoom(["Snake", msg]),
            },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }

    case "Chess": {
      if (model[0] === "Chess") {
        return tagUpdate(
          "Chess",
          Chess.updateFromFrontend(
            {
              hostId: hostId,
              sendToClient: (msg) => sendToClient(["Chess", msg]),
              sendToRoom: (msg) => sendToRoom(["Chess", msg]),
            },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }
  }
}

export const updateRoomLeave = ({ sendToRoom }: { sendToRoom: (msg: ToFrontend) => Cmd.Cmd<never> }, userId: UserId.UserId, model: Model): [Model, Cmd.Cmd<Msg>] => {
  console.log("updateRoomLeave", userId, model)
  switch (model[0]) {
    case 'Chess': {
      const [child, cmd] = Chess.updateRoomLeave({ sendToRoom: msg => sendToRoom(['Chess', msg]) }, userId, model[1])
      return [['Chess', child], tagCmd("Chess", cmd)]
    }

    case 'ConnectFour': {
      return [model, Cmd.None]
    }

    case 'Snake': {
      return [model, Cmd.None]
    }

    case 'Tetris': {
      return [model, Cmd.None]
    }

    case 'TicTacToe': {
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
  intervalId: string,
  model: Model,
): Sub.Sub<Msg> => {
  switch (model[0]) {
    case "ConnectFour": {
      return tagSub("ConnectFour", ConnectFour.subscriptions(intervalId, model[1]))
    }
    case "TicTacToe": {
      return tagSub("TicTacToe", TicTacToe.subscriptions(intervalId, model[1]))
    }
    case "Snake": {
      return tagSub("Snake", Snake.subscriptions(intervalId, model[1]))
    }
    case "Chess": {
      return tagSub("Chess", Chess.subscriptions(intervalId, model[1]))
    }
    case "Tetris": {
      return tagSub("Tetris", Tetris.subscriptions(intervalId, model[1]))
    }
  }
}
