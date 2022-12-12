import * as Alerts from "../Alerts"
import { Cmd, Sub, tagUpdate } from "../Core"
import * as ProfileStore from "../Profile/Profile.Store"
import * as Chess from "./Chess/Chess.Frontend"
import * as ConnectFour from "./ConnectFour/ConnectFour.Frontend"
import { Ctx, GameRoomCtx } from "./Game.Shared"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  GameName,
  ToBackend,
  ToFrontend
} from "./Game.Types"
import * as Maze from "./Maze/Maze.Frontend"
import * as Snake from "./Snake/Snake.Frontend"
import * as Tetris from "./Tetris/Tetris.Frontend"
import * as TicTacToe from "./TicTacToe/TicTacToe.Frontend"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = ({
  gameName,
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd
  gameName: Model[0]
}): [Model, Cmd<Msg>] => {
  switch (gameName) {
    case "TicTacToe": {
      return [["TicTacToe", TicTacToe.init], Cmd.None]
    }

    case "Snake": {
      return [["Snake", Snake.init], Cmd.None]
    }

    case "ConnectFour": {
      return [["ConnectFour", ConnectFour.init], Cmd.None]
    }

    case "Tetris": {
      return [["Tetris", Tetris.init], Cmd.None]
    }

    case "Chess": {
      const [child, cmd] = Chess.init({
        sendToBackend: (msg) => sendToBackend(["Chess", msg]),
      })
      return [["Chess", child], Cmd.tag("Chess", cmd)]
    }

    case "Maze": {
      return [["Maze", Maze.init({})], Cmd.None]
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

export type Msg = FrontendMsg

export type OutAction = Alerts.Action | ProfileStore.Action

export const update = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx
    sendToBackend: (msg: ToBackend) => Cmd
  },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (model[0]) {
    case "Maze": {
      if (msg[0] === "Maze") {
        const [child, cmd] = Maze.update(
          { ctx, sendToBackend: (m) => sendToBackend(["Maze", m]) },
          msg[1],
          model[1],
        )

        return [["Maze", child], Cmd.tag("Maze", cmd)]
      }

      return [model, Cmd.None]
    }

    case "ConnectFour": {
      if (msg[0] === "ConnectFour") {
        return tagUpdate(
          "ConnectFour",
          ConnectFour.update(
            { sendToBackend: (msg) => sendToBackend(["ConnectFour", msg]) },
            msg[1],
            model[1],
          ),
        )
      }

      return [model, Cmd.None]
    }

    case "Tetris": {
      if (msg[0] === "Tetris") {
        return tagUpdate(
          "Tetris",
          Tetris.update(
            { sendToBackend: (msg) => sendToBackend(["Tetris", msg]) },
            msg[1],
            model[1],
          ),
        )
      }

      return [model, Cmd.None]
    }

    case "Snake": {
      if (msg[0] === "Snake") {
        return tagUpdate(
          "Snake",
          Snake.update(
            {
              ctx,
              sendToBackend: (msg) => sendToBackend(["Snake", msg]),
            },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }

    case "TicTacToe": {
      if (msg[0] === "TicTacToe") {
        return tagUpdate(
          "TicTacToe",
          TicTacToe.update(
            {
              sendToBackend: (msg) => sendToBackend(["TicTacToe", msg]),
            },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }

    case "Chess": {
      if (msg[0] === "Chess") {
        return tagUpdate(
          "Chess",
          Chess.update(
            { sendToBackend: (msg) => sendToBackend(["Chess", msg]) },
            msg[1],
            model[1],
          ),
        )
      }
      return [model, Cmd.None]
    }
  }
}

export const updateFromBackend = (
  {
    ctx,
    sendToBackend,
  }: {
    ctx: Ctx
    sendToBackend: (msg: ToBackend) => Cmd
  },
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "Tetris": {
      if (model[0] === "Tetris") {
        return [
          ...tagUpdate("Tetris", Tetris.updateFromBackend(msg[1], model[1])),
          [],
        ]
      }

      return [model, Cmd.None, []]
    }

    case "ConnectFour": {
      if (model[0] === "ConnectFour") {
        const [child, cmd, actions] = ConnectFour.updateFromBackend(
          msg[1],
          model[1],
        )
        return [["ConnectFour", child], Cmd.tag("ConnectFour", cmd), actions]
      }
      return [model, Cmd.None, []]
    }

    case "Snake": {
      if (model[0] === "Snake") {
        const [child, cmd, actions] = Snake.updateFromBackend(msg[1], model[1])
        return [["Snake", child], Cmd.tag("Snake", cmd), actions]
      }
      return [model, Cmd.None, []]
    }

    case "TicTacToe": {
      if (model[0] === "TicTacToe") {
        const [child, cmd, actions] = TicTacToe.updateFromBackend(
          { ctx },
          msg[1],
          model[1],
        )
        return [["TicTacToe", child], Cmd.tag("TicTacToe", cmd), actions]
      }
      return [model, Cmd.None, []]
    }

    case "Chess": {
      if (model[0] === "Chess") {
        const [child, cmd, actions] = Chess.updateFromBackend(
          {
            ctx,
            sendToBackend: (msg) => sendToBackend(["Chess", msg]),
          },
          msg[1],
          model[1],
        )

        return [["Chess", child], Cmd.tag("Chess", cmd), actions]
      }
      return [model, Cmd.None, []]
    }

    case "Maze": {
      if (model[0] === "Maze") {
        const [child, cmd] = Maze.updateFromBackend(msg[1], model[1])
        return [["Maze", child], Cmd.tag("Maze", cmd), []]
      }
      return [model, Cmd.None, []]
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
      return Sub.None
    }

    case "Snake": {
      return Sub.tag(
        "Snake",
        Snake.subscriptions(`snake-${intervalId}`, model[1]),
      )
    }

    case "TicTacToe": {
      return Sub.None
    }

    case "Chess": {
      return Sub.tag("Chess", Chess.subscriptions(model[1]))
    }

    case "Tetris": {
      return Sub.tag("Tetris", Tetris.subscriptions(model[1]))
    }

    case "Maze": {
      return Sub.tag("Maze", Maze.subscriptions(model[1]))
    }
  }
}

//
//
//
// View
//
//
//

export const View = ({
  ctx,
  gameRoomCtx,
  model,
  $d,
}: {
  ctx: Ctx
  gameRoomCtx: GameRoomCtx,
  model: Model
  $d: (msg: Msg) => void
}) => {


  const views: { [key in typeof model[0]]: Function } = {
    Tetris: (model: Tetris.Model) => (
      <Tetris.View model={model} $d={(msg) => $d(["Tetris", msg])} />
    ),

    ConnectFour: (model: ConnectFour.Model) => (
      <ConnectFour.View
        gameRoomCtx={gameRoomCtx}
        ctx={ctx}
        model={model}
        $d={(msg) => $d(["ConnectFour", msg])}
      />
    ),

    Snake: (model: Snake.Model) => (
      <Snake.View ctx={ctx} model={model} $d={(msg) => $d(["Snake", msg])} />
    ),

    TicTacToe: (model: TicTacToe.Model) => (
      <TicTacToe.View
        gameRoomCtx={gameRoomCtx}
        ctx={ctx}
        model={model}
        $d={(msg) => $d(["TicTacToe", msg])}
      />
    ),

    Chess: (model: Chess.Model) => (
      <Chess.View ctx={ctx} model={model} $d={(msg) => $d(["Chess", msg])} gameRoomCtx={gameRoomCtx} />
    ),

    Maze: (model: Maze.Model) => (
      <Maze.View ctx={ctx} model={model} $d={(m) => $d(["Maze", m])} />
    ),
  }
  return views[model[0]](model[1])
}

export const gameNameToString = (game: GameName): string => {
  switch (game) {
    case "ConnectFour": {
      return "Connect Four"
    }

    case "TicTacToe": {
      return "Tic-Tac-Toe"
    }

    case "Snake": {
      return "Snake"
    }

    case "Chess": {
      return "Chess"
    }

    case "Tetris": {
      return "Tetris"
    }

    case "Maze": {
      return "Maze"
    }
  }
}

export const CoverArt = ({ gameName }: { gameName: GameName }) => {
  switch (gameName) {
    case "Chess": {
      return <Chess.CoverArt />
    }
    case "ConnectFour": {
      return <ConnectFour.CoverArt />
    }
    case "Snake": {
      return <Snake.CoverArt />
    }
    case "TicTacToe": {
      return <TicTacToe.CoverArt />
    }
    case "Tetris": {
      return <Tetris.CoverArt />
    }
    case "Maze": {
      return <Maze.CoverArt />
    }
  }
}

export const mergeWithBackend = ({
  sendToBackend,
  frontendModel,
  backendModel,
}: {
  sendToBackend: (msg: ToBackend) => Cmd
  frontendModel: FrontendModel
  backendModel: BackendModel
}): [FrontendModel, Cmd<Msg>] => {
  switch (backendModel[0]) {
    case "Tetris": {
      if (frontendModel[0] === "Tetris") {
        const merged = Tetris.mergeWithBackend({
          backendModel: backendModel[1],
          frontendModel: frontendModel[1],
        })
        return [["Tetris", merged], Cmd.None]
      }

      const initial = Tetris.init

      return [["Tetris", initial], Cmd.None]
    }

    case "Chess": {
      if (frontendModel[0] === "Chess") {
        const merged = Chess.mergeWithBackend({
          sendToBackend: (msg) => sendToBackend(["Chess", msg]),
          frontendModel: frontendModel[1],
          backendModel: backendModel[1],
        })

        return [["Chess", merged[0]], Cmd.tag("Chess", merged[1])]
      }

      const initial = Chess.init({
        sendToBackend: (msg) => sendToBackend(["Chess", msg]),
      })

      const merged = Chess.mergeWithBackend({
        sendToBackend: (msg) => sendToBackend(["Chess", msg]),
        frontendModel: initial[0],
        backendModel: backendModel[1],
      })

      return [
        ["Chess", merged[0]],
        Cmd.batch([Cmd.tag("Chess", initial[1]), Cmd.tag("Chess", merged[1])]),
      ]
    }

    case "ConnectFour": {
      if (frontendModel[0] === "ConnectFour") {
        return [
          [
            "ConnectFour",
            ConnectFour.mergeWithBackend({
              frontendModel: frontendModel[1],
              backendModel: backendModel[1],
            }),
          ],
          Cmd.None,
        ]
      }

      const initial = ConnectFour.init

      return [
        [
          "ConnectFour",
          ConnectFour.mergeWithBackend({
            frontendModel: initial,
            backendModel: backendModel[1],
          }),
        ],
        Cmd.None,
      ]
    }

    case "Snake": {
      if (frontendModel[0] === "Snake") {
        return [
          ["Snake", Snake.mergeWithBackend(frontendModel[1], backendModel[1])],
          Cmd.None,
        ]
      }

      const initial = Snake.init

      return [
        ["Snake", Snake.mergeWithBackend(initial, backendModel[1])],
        Cmd.None,
      ]
    }

    case "TicTacToe": {
      if (frontendModel[0] === "TicTacToe") {
        return [
          [
            "TicTacToe",
            TicTacToe.mergeWithBackend(frontendModel[1], backendModel[1]),
          ],
          Cmd.None,
        ]
      }

      const initial = TicTacToe.init

      return [
        ["TicTacToe", TicTacToe.mergeWithBackend(initial, backendModel[1])],
        Cmd.None,
      ]
    }

    case "Maze": {
      if (frontendModel[0] === "Maze") {
        return [
          [
            "Maze",
            Maze.mergeWithBackend({
              frontendModel: frontendModel[1],
              backendModel: backendModel[1],
            }),
          ],
          Cmd.None,
        ]
      }
      return [["Maze", Maze.init({})], Cmd.None]
    }
  }
}
