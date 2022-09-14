import { Cmd, pipe, Sub, tag, tagCmd, tagSub, tagUpdate } from "../Core"
import { RoomId, UserId } from "../Data"
import * as Snackbar from "../Snackbar"
import * as Store from "../Store"
import * as UI from "../UI"
import * as Chess from "./Chess/Chess.Frontend"
import * as ConnectFour from "./ConnectFour/ConnectFour.Frontend"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  GameName,
  ToBackend,
  ToFrontend,
} from "./Game.Types"
import * as Snake from "./Snake/Snake.Frontend"
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
  sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  gameName: Model[0]
}): [Model, Cmd.Cmd<Msg>] => {
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

    case "Chess": {
      const [child, cmd] = Chess.init({
        sendToBackend: (msg) => sendToBackend(["Chess", msg]),
      })
      return [["Chess", child], tagCmd("Chess", cmd)]
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

export type OutAction = Snackbar.Action

export const update = (
  {
    currentUserId,
    currentRoomId,
    sendToBackend,
  }: {
    currentUserId: UserId.UserId
    currentRoomId: RoomId.RoomId
    sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (model[0]) {
    case "ConnectFour": {
      if (msg[0] === "ConnectFour") {
        return tagUpdate("ConnectFour", ConnectFour.update(msg[1], model[1]))
      }

      return [model, Cmd.None]
    }

    case "Snake": {
      if (msg[0] === "Snake") {
        return tagUpdate(
          "Snake",
          Snake.update(
            {
              currentUserId,
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
          TicTacToe.update({ currentUserId }, msg[1], model[1]),
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
  { currentUserId, sendToBackend }: { currentUserId: UserId.UserId, sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ConnectFour": {
      if (model[0] === "ConnectFour") {
        return [
          ...tagUpdate(
            "ConnectFour",
            ConnectFour.updateFromBackend(msg[1], model[1]),
          ),
          [],
        ]
      }
      return [model, Cmd.None, []]
    }

    case "Snake": {
      if (model[0] === "Snake") {
        const [child, cmd, actions] = Snake.updateFromBackend(msg[1], model[1])
        return [["Snake", child], tagCmd("Snake", cmd), actions]
      }
      return [model, Cmd.None, []]
    }

    case "TicTacToe": {
      if (model[0] === "TicTacToe") {
        return [
          ...tagUpdate(
            "TicTacToe",
            TicTacToe.updateFromBackend(msg[1], model[1]),
          ),
          [],
        ]
      }
      return [model, Cmd.None, []]
    }

    case "Chess": {
      if (model[0] === "Chess") {
        const [child, cmd, actions] = Chess.updateFromBackend(
          { currentUserId, sendToBackend: (msg) => sendToBackend(["Chess", msg]) },
          msg[1],
          model[1],
        )

        return [["Chess", child], tagCmd("Chess", cmd), actions]
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

export const subscriptions = (
  intervalId: string,
  model: Model,
): Sub.Sub<Msg> => {
  switch (model[0]) {
    case "ConnectFour": {
      return Sub.None
    }
    case "Snake": {
      return tagSub(
        "Snake",
        Snake.subscriptions(`snake-${intervalId}`, model[1]),
      )
    }
    case "TicTacToe": {
      return Sub.None
    }
    case "Chess": {
      return tagSub("Chess", Chess.subscriptions(model[1]))
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
  currentUserId,
  store,
  model,
  dispatch,
  onCloseGame,
  roomAvatarGroup,
}: {
  onCloseGame: () => void
  currentUserId: UserId.UserId
  store: Store.Model
  model: Model
  dispatch: (msg: Msg) => void
  roomAvatarGroup: UI.ViewNode
}) => {
  switch (model[0]) {
    case "ConnectFour": {
      return (
        <ConnectFour.View
          model={model[1]}
          dispatch={(msg) => dispatch(["ConnectFour", msg])}
          onCloseGame={onCloseGame}
        />
      )
    }

    case "Snake": {
      return (
        <Snake.View
          currentUserId={currentUserId}
          store={store}
          model={model[1]}
          dispatch={(msg) => dispatch(["Snake", msg])}
        />
      )
    }

    case "TicTacToe": {
      return (
        <TicTacToe.View
          currentUserId={currentUserId}
          store={store}
          model={model[1]}
          dispatch={(msg) => dispatch(["TicTacToe", msg])}
          onCloseGame={onCloseGame}
        />
      )
    }

    case "Chess": {
      return (
        <Chess.View
          onCloseGame={onCloseGame}
          currentUserId={currentUserId}
          store={store}
          model={model[1]}
          dispatch={(msg) => dispatch(["Chess", msg])}
          roomAvatarGroup={roomAvatarGroup}
        />
      )
    }
  }
}

export const gameNameToString = (game: GameName): string => {
  switch (game) {
    case "ConnectFour":
      return "Connect Four"

    case "TicTacToe":
      return "Tic Tac Toe"

    case "Snake":
      return "Snake"

    case "Chess":
      return "Chess"
  }
}

export const CoverArt = ({ gameName }: { gameName: GameName }) => {
  switch (gameName) {
    case "Chess": {
      return <Chess.CoverArt />
    }
    case "ConnectFour": {
      return <ConnectFour.CoverArt id="" />
    }
    case "Snake": {
      return <Snake.CoverArt />
    }
    case "TicTacToe": {
      return <TicTacToe.CoverArt />
    }
  }
}

export const mergeWithBackend = ({
  sendToBackend,
  frontendModel,
  backendModel,
}: {
  sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  frontendModel: FrontendModel
  backendModel: BackendModel
}): [FrontendModel, Cmd.Cmd<Msg>] => {
  switch (backendModel[0]) {
    case "Chess": {
      if (frontendModel[0] === "Chess") {
        const merged = Chess.mergeWithBackend({
          sendToBackend: (msg) => sendToBackend(["Chess", msg]),
          frontendModel: frontendModel[1],
          backendModel: backendModel[1],
        })

        return [["Chess", merged[0]], tagCmd("Chess", merged[1])]
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
        Cmd.batch([tagCmd("Chess", initial[1]), tagCmd("Chess", merged[1])]),
      ]
    }

    case "ConnectFour": {
      if (frontendModel[0] === "ConnectFour") {
        return [
          [
            "ConnectFour",
            ConnectFour.mergeWithBackend(frontendModel[1], backendModel[1]),
          ],
          Cmd.None,
        ]
      }

      const initial = ConnectFour.init

      return [
        ["ConnectFour", ConnectFour.mergeWithBackend(initial, backendModel[1])],
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
  }
}
