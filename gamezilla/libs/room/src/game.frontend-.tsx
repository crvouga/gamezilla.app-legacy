import { Alerts } from "@gamezilla/alerts"
import { Cmd, Sub } from "@gamezilla/core"
import { GameRoomCtx } from "@gamezilla/game-shared"
import { ChessFrontend as Chess } from "@gamezilla/game/chess"
import { ConnectFourFrontend as ConnectFour } from "@gamezilla/game/connect-four"
import { GomokuFrontend as Gomoku } from "@gamezilla/game/gomoku"
import { TicTacToeFrontend as TicTacToe } from "@gamezilla/game/tic-tac-toe"
import { ProfileStore } from "@gamezilla/profile"
import { Ctx } from "@gamezilla/shared"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  GameName,
  ToBackend,
  ToFrontend
} from "./game.types-"


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
}: {
  gameName: Model[0]
}): [Model, Cmd<Msg>] => {
  switch (gameName) {
    case "TicTacToe": {
      return [["TicTacToe", TicTacToe.init], Cmd.None]
    }

    case "connect-four": {
      return [["connect-four", ConnectFour.init], Cmd.None]
    }

    case "Chess": {
      const [child, cmd] = Chess.init()
      return [["Chess", child], Cmd.tag("Chess", cmd)]
    }

    case 'Gomoku': {
      return [['Gomoku', Gomoku.init], Cmd.None]
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
    case "connect-four": {
      if (msg[0] === "connect-four") {
        const [child, cmd] = ConnectFour.update(
          { sendToBackend: (msg) => sendToBackend(["connect-four", msg]) },
          msg[1],
          model[1],
        )
        return [["connect-four", child], Cmd.tag("connect-four", cmd)]

      }

      return [model, Cmd.None]
    }


    case "TicTacToe": {
      if (msg[0] === "TicTacToe") {
        const [child, cmd] = TicTacToe.update(
          { sendToBackend: (msg) => sendToBackend(["TicTacToe", msg]) },
          msg[1],
          model[1],
        )
        return [["TicTacToe", child], Cmd.tag("TicTacToe", cmd)]
      }
      return [model, Cmd.None]
    }

    case "Chess": {
      if (msg[0] === "Chess") {
        const [child, cmd] = Chess.update(
          { sendToBackend: (msg) => sendToBackend(["Chess", msg]) },
          msg[1],
          model[1],
        )
        return [["Chess", child], Cmd.tag("Chess", cmd)]
      }
      return [model, Cmd.None]
    }

    case 'Gomoku': {
      if (msg[0] === 'Gomoku') {
        const [child, cmd] = Gomoku.update(
          { sendToBackend: (msg) => sendToBackend(['Gomoku', msg]) },
          msg[1],
          model[1],
        )
        return [['Gomoku', child], Cmd.tag('Gomoku', cmd)]
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
    case "connect-four": {
      if (model[0] === "connect-four") {
        const [child, cmd, actions] = ConnectFour.updateFromBackend(
          msg[1],
          model[1],
        )
        return [["connect-four", child], Cmd.tag("connect-four", cmd), actions]
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

    case 'Gomoku': {
      if (model[0] === 'Gomoku') {
        const [child, cmd] = Gomoku.updateFromBackend(msg[1], model[1])
        return [['Gomoku', child], Cmd.tag('Gomoku', cmd), []]
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
    case "connect-four": {
      return Sub.tag('connect-four', ConnectFour.subscriptions(model[1]))
    }

    case "TicTacToe": {
      return Sub.None
    }

    case "Chess": {
      return Sub.tag("Chess", Chess.subscriptions(model[1]))
    }

    case 'Gomoku': {
      return Sub.tag('Gomoku', Gomoku.subscriptions(model[1]))
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
  $send,
}: {
  ctx: Ctx
  gameRoomCtx: GameRoomCtx,
  model: Model
  $send: (msg: Msg) => void
}) => {

  switch (model[0]) {
    case "connect-four": {
      return (
        <ConnectFour.View
          gameRoomCtx={gameRoomCtx}
          ctx={ctx}
          model={model[1]}
          $send={(msg) => $send(["connect-four", msg])}
        />
      )
    }

    case "TicTacToe": {
      return (
        <TicTacToe.View
          gameRoomCtx={gameRoomCtx}
          ctx={ctx}
          model={model[1]}
          $send={(msg) => $send(["TicTacToe", msg])}
        />
      )
    }

    case "Chess": {
      return (
        <Chess.View
          ctx={ctx}
          model={model[1]}
          $send={(msg) => $send(["Chess", msg])}
          gameRoomCtx={gameRoomCtx}
        />
      )
    }

    case 'Gomoku': {
      return (
        Gomoku.view({
          $send: (msg) => $send(['Gomoku', msg]),
          model: model[1],
          gameRoomCtx,
          ctx
        })

      )
    }
  }
}


export const gameNameToString = (game: GameName): string => {
  switch (game) {
    case "connect-four": {
      return "Connect Four"
    }

    case "TicTacToe": {
      return "Tic-Tac-Toe"
    }

    case "Chess": {
      return "Chess"
    }

    case 'Gomoku': {
      return "Gomoku"
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
    case "Chess": {
      if (frontendModel[0] === "Chess") {
        const merged = Chess.mergeWithBackend({
          sendToBackend: (msg) => sendToBackend(["Chess", msg]),
          frontendModel: frontendModel[1],
          backendModel: backendModel[1],
        })

        return [["Chess", merged[0]], Cmd.tag("Chess", merged[1])]
      }

      const initial = Chess.init()

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

    case "connect-four": {
      if (frontendModel[0] === "connect-four") {
        return [
          [
            "connect-four",
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
          "connect-four",
          ConnectFour.mergeWithBackend({
            frontendModel: initial,
            backendModel: backendModel[1],
          }),
        ],
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

    case 'Gomoku': {
      if (frontendModel[0] === "Gomoku") {
        return [
          [
            "Gomoku",
            Gomoku.mergeWithBackend({
              frontendModel: frontendModel[1],
              backendModel: backendModel[1],
            }),
          ],
          Cmd.None,
        ]
      }

      return [
        ["Gomoku", Gomoku.mergeWithBackend({ frontendModel: Gomoku.init, backendModel: backendModel[1], })],
        Cmd.None
      ]
    }
  }
}
