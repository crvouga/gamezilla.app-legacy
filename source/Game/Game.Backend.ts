import { Cmd, Sub } from "../Core"
import { UserId } from "../Data"
import * as Chess from "./Chess/Chess.Backend"
import * as ConnectFour from "./ConnectFour/ConnectFour.Backend"
import { BackendModel, BackendMsg, ToBackend, ToFrontend } from "./Game.Types"
import * as Maze from "./Maze/Maze.Backend"
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

    case "Maze": {
      return ["Maze", Maze.init]
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
  { broadcast }: { broadcast: (m: ToFrontend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "Tetris": {
      if (model[0] === "Tetris") {
        const [child, cmd] = Tetris.update(
          { broadcast: (m) => broadcast(["Tetris", m]) },
          msg[1],
          model[1],
        )
        return [["Tetris", child], Cmd.tag("Tetris", cmd)]
      }
      return [model, Cmd.None]
    }

    case "ConnectFour": {
      if (model[0] === "ConnectFour") {
        const [child, cmd] = ConnectFour.update(
          { broadcast: (m) => broadcast(["ConnectFour", m]) },
          msg[1],
          model[1],
        )
        return [["ConnectFour", child], Cmd.tag("ConnectFour", cmd)]
      }
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (model[0] === "TicTacToe") {
        const [child, cmd] = TicTacToe.update(
          { broadcast: (m) => broadcast(["TicTacToe", m]) },
          msg[1],
          model[1],
        )
        return [["TicTacToe", child], Cmd.tag("TicTacToe", cmd)]
      }
      return [model, Cmd.None]
    }

    case "Snake": {
      if (model[0] === "Snake") {
        const [child, cmd] = Snake.update(
          { broadcast: (m) => broadcast(["Snake", m]) },
          msg[1],
          model[1],
        )
        return [["Snake", child], Cmd.tag("Snake", cmd)]
      }
      return [model, Cmd.None]
    }

    case "Chess": {
      if (model[0] === "Chess") {
        const [child, cmd] = Chess.update(
          { broadcast: (m) => broadcast(["Chess", m]) },
          msg[1],
          model[1],
        )
        return [["Chess", child], Cmd.tag("Chess", cmd)]
      }
      return [model, Cmd.None]
    }

    case "Maze": {
      if (model[0] === "Maze") {
        const [child, cmd] = Maze.update({ broadcast: (m) => broadcast(['Maze', m]) }, msg[1], model[1])
        return [["Maze", child], Cmd.tag("Maze", cmd)]
      }
      return [model, Cmd.None]
    }
  }
}

export const updateFromFrontend = (
  {
    hostId,
    sendToClient,
    broadcast,
  }: {
    hostId: UserId
    sendToClient: (msg: ToFrontend) => Cmd
    broadcast: (msg: ToFrontend) => Cmd
  },
  msg: ToBackend,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "Tetris": {
      if (model[0] === "Tetris") {
        const [child, cmd] = Tetris.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["Tetris", msg]),
            broadcast: (msg) => broadcast(["Tetris", msg]),
          },
          msg[1],
          model[1],
        )
        return [["Tetris", child], Cmd.tag("Tetris", cmd)]
      }

      return [model, Cmd.None]
    }

    case "ConnectFour": {
      if (model[0] === "ConnectFour") {
        const [child, cmd] = ConnectFour.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["ConnectFour", msg]),
            broadcast: (msg) => broadcast(["ConnectFour", msg]),
          },
          msg[1],
          model[1],
        )
        return [["ConnectFour", child], Cmd.tag("ConnectFour", cmd)]
      }
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (model[0] === "TicTacToe") {
        const [child, cmd] = TicTacToe.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["TicTacToe", msg]),
            broadcast: (msg) => broadcast(["TicTacToe", msg]),
          },
          msg[1],
          model[1],
        )
        return [["TicTacToe", child], Cmd.tag("TicTacToe", cmd)]
      }
      return [model, Cmd.None]
    }

    case "Snake": {
      if (model[0] === "Snake") {
        const [child, cmd] = Snake.updateFromFrontend(
          {
            sendToClient: (msg) => sendToClient(["Snake", msg]),
            broadcast: (msg) => broadcast(["Snake", msg]),
          },
          msg[1],
          model[1],
        )
        return [["Snake", child], Cmd.tag("Snake", cmd)]
      }
      return [model, Cmd.None]
    }

    case "Chess": {
      if (model[0] === "Chess") {
        const [child, cmd] = Chess.updateFromFrontend(
          {
            hostId: hostId,
            sendToClient: (msg) => sendToClient(["Chess", msg]),
            broadcast: (msg) => broadcast(["Chess", msg]),
          },
          msg[1],
          model[1],
        )
        return [["Chess", child], Cmd.tag("Chess", cmd)]
      }
      return [model, Cmd.None]
    }

    case "Maze": {
      if (model[0] === "Maze") {
        const [child, cmd] = Maze.updateFromFrontend(
          { broadcast: (m) => broadcast(["Maze", m]) },
          msg[1],
          model[1],
        )
        return [["Maze", child], Cmd.tag("Maze", cmd)]
      }
      return [model, Cmd.None]
    }
  }
}

export const updateRoomLeave = (
  { broadcast }: { broadcast: (msg: ToFrontend) => Cmd },
  userId: UserId,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (model[0]) {
    case "Chess": {
      const [child, cmd] = Chess.updateRoomLeave(
        { broadcast: (msg) => broadcast(["Chess", msg]) },
        userId,
        model[1],
      )
      return [["Chess", child], Cmd.tag("Chess", cmd)]
    }

    case "ConnectFour": {
      const [child, cmd] = ConnectFour.updateRoomLeave({
        userId,
        model: model[1],
        broadcast: (msg) => broadcast(["ConnectFour", msg]),
      })
      return [["ConnectFour", child], Cmd.tag("ConnectFour", cmd)]
    }

    case "Snake": {
      return [model, Cmd.None]
    }

    case "Tetris": {
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      const [child, cmd] = TicTacToe.updateRoomLeave(
        { broadcast: (msg) => broadcast(["TicTacToe", msg]) },
        userId,
        model[1],
      )
      return [["TicTacToe", child], Cmd.tag("TicTacToe", cmd)]
    }

    case "Maze": {
      const [child, cmd] = Maze.updateRoomLeave(userId, model[1])
      return [["Maze", child], Cmd.tag("Maze", cmd)]
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

export const subscriptions = (intervalId: string, model: Model): Sub<Msg> => {
  switch (model[0]) {
    case "ConnectFour": {
      return Sub.tag(
        "ConnectFour",
        ConnectFour.subscriptions(intervalId, model[1]),
      )
    }
    case "TicTacToe": {
      return Sub.tag("TicTacToe", TicTacToe.subscriptions(intervalId, model[1]))
    }
    case "Snake": {
      return Sub.tag("Snake", Snake.subscriptions(intervalId, model[1]))
    }
    case "Chess": {
      return Sub.tag("Chess", Chess.subscriptions(intervalId, model[1]))
    }
    case "Tetris": {
      return Sub.tag("Tetris", Tetris.subscriptions(intervalId, model[1]))
    }
    case "Maze": {
      return Sub.tag("Maze", Maze.subscriptions(intervalId, model[1]))
    }
  }
}
