import * as Route from "../Route"
import * as Snackbar from "../Snackbar"
import * as Store from "../Store"
import * as UI from "../UI"
import * as Chess from "./Chess"
import * as ConnectFour from "./ConnectFour"
import * as Snake from "./Snake"
import * as TicTacToe from "./TicTacToe/Frontend"
import { Cmd, exhaustive, pipe, Sub, tag } from "../Core"
import {
  Closed,
  FrontendModel,
  FrontendMsg,
  GameName,
  Opened,
  ToFrontend,
} from "./Types"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

//
//
//
// Init
//
//
//

export const init: Model = { type: "Closed" }

const initOpened = ({ game }: { game: GameName }): [Opened, Cmd.Cmd<Msg>] => {
  const [child, childCmd] = initGame({ game })
  return [
    { type: "Opened", status: "Idle", child },
    Cmd.batch([Route.push({ type: "Game" }), childCmd]),
  ]
}

const initGame = ({
  game,
}: {
  game: GameName
}): [Opened["child"], Cmd.Cmd<Msg>] => {
  switch (game) {
    case "Chess":
      return [["Chess", Chess.init], Cmd.None]

    case "ConnectFour":
      return [["ConnectFour", ConnectFour.init], Cmd.None]

    case "TicTacToe": {
      const [child, childCmd] = TicTacToe.init
      return [
        ["TicTacToe", child],
        pipe(childCmd, Cmd.map(tag("TicTacToe"))),
      ]
    }

    case "Snake":
      return [["Snake", Snake.init], Cmd.None]
  }
}

//
//
//
// Msg
//
//
//

export type Msg = FrontendMsg

type OutAction = Snackbar.Action | Store.Action

export type Action =
  | ["Games", ["Open", GameName]]
  | ["Games", ["Close", GameName]]

//
//
//
// Update
//
//
//

export const runAction = (
  action: Action,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (action[1][0]) {
    case "Open":
      const gameName = action[1][1]

      if (model.type === "Closed") {
        return initOpened({ game: gameName })
      }

      if (gameName === model.child[0]) {
        return [model, Route.push({ type: "Game" })]
      }

      return [model, Cmd.None]

    case "Close":
      return [model, Cmd.None]
  }
}

export const update = (
  { currentUserId }: { currentUserId: string },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model.type) {
    case "Closed":
      return updateClosed(msg, model)

    case "Opened":
      return updateOpened({ currentUserId }, msg, model)
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model.type) {
    case "Closed":
      return [model, Cmd.None, []]

    case "Opened":
      const [childNew, childCmd, actions] = updateGameFromBackend(
        msg,
        model.child,
      )
      return [{ ...model, child: childNew }, childCmd, actions]
  }
}

const updateGameFromBackend = (
  msg: ToFrontend,
  model: Opened["child"],
): [Opened["child"], Cmd.Cmd<Msg>, OutAction[]] => {
  switch (model[0]) {
    case "Chess":
      return [model, Cmd.None, []]

    case "ConnectFour":
      return [model, Cmd.None, []]

    case "Snake":
      return [model, Cmd.None, []]

    case "TicTacToe":
      if (msg[0] === "TicTacToe") {
        const [modelChild, cmdChild, actions] = TicTacToe.updateFromBackend(
          msg[1],
          model[1],
        )

        return [
          ["TicTacToe", modelChild],
          pipe(cmdChild, Cmd.map(tag("TicTacToe"))),
          actions,
        ]
      }

      return [model, Cmd.None, []]

    default:
      return exhaustive(model[0])
  }
}

const updateOpened = (
  { currentUserId }: { currentUserId: string },
  msg: Msg,
  model: Opened,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "ClickedClose":
      return [{ ...model, status: "ConfirmingClose" }, Cmd.None, []]

    case "ClickedBanner":
      return [model, Route.push({ type: "Game" }), []]

    case "CancelledClose":
      return [{ ...model, status: "Idle" }, Cmd.None, []]

    case "ConfirmedClose":
      return [{ type: "Closed" }, Cmd.None, []]

    case "Chess":
    case "ConnectFour":
    case "Snake":
    case "TicTacToe":
      const [child, childCmd] = updateGame({ currentUserId }, msg, model.child)
      return [{ ...model, child }, childCmd, []]
  }
}

const updateGame = (
  { currentUserId }: { currentUserId: string },
  msg: Msg,
  model: Opened["child"],
): [Opened["child"], Cmd.Cmd<Msg>] => {
  switch (model[0]) {
    case "Chess":
      if (msg[0] === "Chess") {
        const [modelChild, cmdChild] = Chess.update(msg[1], model[1])
        return [
          ["Chess", modelChild],
          pipe(cmdChild, Cmd.map(tag("Chess"))),
        ]
      }
      return [model, Cmd.None]

    case "ConnectFour":
      if (msg[0] === "ConnectFour") {
        const [modelChild, cmdChild] = ConnectFour.update(msg[1], model[1])

        return [
          ["ConnectFour", modelChild],
          pipe(cmdChild, Cmd.map(tag("ConnectFour"))),
        ]
      }
      return [model, Cmd.None]

    case "TicTacToe":
      if (msg[0] === "TicTacToe") {
        const [modelChild, cmdChild] = TicTacToe.update(
          { currentUserId },
          msg[1],
          model[1],
        )

        return [
          ["TicTacToe", modelChild],
          pipe(cmdChild, Cmd.map(tag("TicTacToe"))),
        ]
      }

      return [model, Cmd.None]

    case "Snake":
      if (msg[0] === "Snake") {
        const [modelChild, cmdChild] = Snake.update(msg[1], model[1])

        return [
          ["Snake", modelChild],
          pipe(cmdChild, Cmd.map(tag("Snake"))),
        ]
      }

      return [model, Cmd.None]

    default:
      return exhaustive(model)
  }
}

const updateClosed = (
  msg: Msg,
  model: Closed,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  return [model, Cmd.None, []]
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  switch (model.type) {
    case "Closed":
      return Sub.None

    case "Opened":
      switch (model.child[0]) {
        case "Chess":
          return Sub.None

        case "ConnectFour":
          return Sub.None

        case "Snake":
          return pipe(
            Snake.subscriptions(model.child[1]),
            Sub.map(tag("Snake")),
          )

        case "TicTacToe":
          return Sub.None
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

export const view = (
  { currentUserId, store }: { currentUserId: string; store: Store.Model },
  model: Model,
): UI.View<Msg> => {
  switch (model.type) {
    case "Closed":
      return () => <>game is closed</>

    case "Opened":
      switch (model.child[0]) {
        case "Chess":
          return pipe(Chess.view(model.child[1]), UI.map(tag("Chess")))

        case "ConnectFour":
          return pipe(
            ConnectFour.view(model.child[1]),
            UI.map(tag("ConnectFour")),
          )

        case "TicTacToe":
          return pipe(
            TicTacToe.view({ currentUserId, store }, model.child[1]),
            UI.map(tag("TicTacToe")),
          )

        case "Snake":
          return pipe(Snake.view(model.child[1]), UI.map(tag("Snake")))
      }
  }
}
export const viewBanner =
  (model: Opened): UI.View<Msg> =>
    (dispatch) =>
    (
      <>
        <UI.Paper
          variant="outlined"
          sx={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            margin: 0,
            padding: 0,
          }}
        >
          <UI.ButtonBase
            sx={{ flex: 1, margin: 0, padding: 0 }}
            onClick={() => dispatch(["ClickedBanner"])}
          >
            <UI.Box sx={{ width: 64, marginRight: 2 }}>
              <CoverArt game={model.child[0]} />
            </UI.Box>
            <UI.Typography align="left" variant="h5" sx={{ flex: 1 }}>
              {gameToName(model.child[0])}
            </UI.Typography>
          </UI.ButtonBase>

          <UI.ButtonBase
            sx={{ width: "15%", height: "100%", p: 2, margin: 0 }}
            onClick={() => dispatch(["ClickedClose"])}
          >
            <UI.Icons.Close />
          </UI.ButtonBase>
        </UI.Paper>

        {UI.conformationDialog<Msg>({
          open: model.status === "ConfirmingClose",
          title: `Close ${gameToName(model.child[0])}?`,
          confirmTitle: `Close ${gameToName(model.child[0])}`,
          onClose: ["CancelledClose"],
          onCancel: ["CancelledClose"],
          onConfirm: ["ConfirmedClose"],
        })(dispatch)}
      </>
    )

export const gameToName = (game: GameName): string => {
  switch (game) {
    case "Chess":
      return "Chess"

    case "ConnectFour":
      return "Connect Four"

    case "TicTacToe":
      return "Tic Tac Toe"

    case "Snake":
      return "Snake"
  }
}

export const CoverArt = ({ game }: { game: GameName }) => {
  switch (game) {
    case "Chess":
      return <Chess.CoverArt />

    case "ConnectFour":
      return <ConnectFour.CoverArt id="connect-four-cover-art" />

    case "TicTacToe":
      return <TicTacToe.CoverArt />

    case "Snake":
      return <Snake.CoverArt />
  }
}
