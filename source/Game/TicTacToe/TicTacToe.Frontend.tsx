import * as Alerts from "../../Alerts"
import { Cmd, exhaustive } from "../../Core"
import * as ProfileStore from "../../Profile/Profile.Store"
import { Ctx, GameRoomCtx, viewSelectModeScreen } from "../Game.Shared"
import { Empty, gameTheme, Position, Slot, ViewSlot } from "./TicTacToe"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend
} from "./TicTacToe.Types"
import * as UserVsBot from "./UserVsBot/UserVsBot.Frontend"
import * as UserVsUser from "./UserVsUser/UserVsUser.Frontend"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = {
  mode: "None",
}

//
//
// Update
//
//
//

export type Msg = FrontendMsg

export type OutAction = ProfileStore.Action | Alerts.Action

export const update = (
  {
    sendToBackend,
  }: {
    sendToBackend: (msg: ToBackend) => Cmd
  },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      return [model, sendToBackend(msg)]
    }

    case "UserVsUser": {
      if (model.mode === "UserVsUser") {
        const [child, cmd] = UserVsUser.update(
          {
            sendToBackend: (msg) => sendToBackend(["UserVsUser", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ mode: "UserVsUser", child }, Cmd.tag("UserVsUser", cmd)]
      }
      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.mode === "UserVsBot") {
        const [child, cmd] = UserVsBot.update(
          {
            // currentUserId,
            sendToBackend: (msg) => sendToBackend(["UserVsBot", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ mode: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
      }
      return [model, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromBackend = (
  { ctx, }: { ctx: Ctx },
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "InputMode_Done": {
      const result = msg[1]

      if (result.type === "Err") {
        return [model, Cmd.None, []]
      }

      const modelNew = mergeWithBackend(model, result.value)

      return [modelNew, Cmd.None, []]
    }

    case "UserVsUser": {
      if (model.mode === "UserVsUser") {
        const [child, actions] = UserVsUser.updateFromBackend(
          { ctx, },
          msg[1],
          model.child,
        )
        return [{ mode: "UserVsUser", child }, Cmd.None, actions]
      }

      return [model, Cmd.None, []]
    }

    case "UserVsBot": {
      if (model.mode === "UserVsBot") {
        const [child, cmd, actions] = UserVsBot.updateFromBackend(
          msg[1],
          model.child,
        )
        return [
          { mode: "UserVsBot", child },
          Cmd.tag("UserVsBot", cmd),
          actions,
        ]
      }

      return [model, Cmd.None, []]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const mergeWithBackend = (
  frontendModel: FrontendModel,
  backendModel: BackendModel,
): FrontendModel => {
  switch (backendModel.mode) {
    case "None": {
      return {
        mode: "None",
      }
    }
    case "UserVsUser": {
      const frontendModelChild =
        frontendModel.mode === "UserVsUser"
          ? frontendModel.child
          : UserVsUser.init

      return {
        mode: "UserVsUser",
        child: UserVsUser.mergeWithBackend(
          frontendModelChild,
          backendModel.child,
        ),
      }
    }

    case "UserVsBot": {
      const frontendModelChild =
        frontendModel.mode === "UserVsBot"
          ? frontendModel.child
          : UserVsBot.init({ userId: "None" })

      return {
        mode: "UserVsBot",
        child: UserVsBot.mergeWithBackend(
          frontendModelChild,
          backendModel.child,
        ),
      }
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
  model,
  $d,
  gameRoomCtx
}: {
  ctx: Ctx
  model: Model
  $d: (msg: Msg) => void
  gameRoomCtx: GameRoomCtx
}) => {
  switch (model.mode) {
    case "None": {
      return (
        viewSelectModeScreen({
          title: "Tic-Tac-Toe",
          ctx,
          gameRoomCtx,
          coverArt: CoverArt(),
          onUserVsUser: () => $d([
            "InputMode",
            { mode: "UserVsUser", userId: ctx.currentUserId },
          ]),
          onUserVsComputer: () => $d([
            "InputMode",
            { mode: "UserVsBot", userId: ctx.currentUserId },
          ])
        })
      )
    }

    case "UserVsUser": {
      return (
        <UserVsUser.View
          onCloseGame={() => {
            $d(["InputMode", { mode: "None", userId: ctx.currentUserId }])
          }}
          ctx={ctx}
          model={model.child}
          $d={(msg) => $d(["UserVsUser", msg])}
        />
      )
    }

    case "UserVsBot": {
      return (
        <UserVsBot.View
          goBack={() => {
            $d(["InputMode", { mode: "None", userId: ctx.currentUserId }])
          }}
          ctx={ctx}
          model={model.child}
          $d={(msg) => $d(["UserVsBot", msg])}
        />
      )
    }
  }
}

//
//
//
//
//
//
//

export const CoverArt = () => {
  const positions: [Position, Slot][] = [
    [{ row: 0, column: 0 }, "X"],
    [{ row: 0, column: 1 }, Empty],
    [{ row: 1, column: 0 }, Empty],
    [{ row: 1, column: 1 }, "O"],
  ]

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const

  return (
    <svg width="100%" viewBox="0 0 2 2">
      <rect x={0} y={0} width={2} height={2} fill={gameTheme.background} />

      {LINES.map((line, index) => (
        <line key={index} {...line} stroke={gameTheme.line} strokeWidth={0.1} />
      ))}

      {positions.map(([{ column, row }, slot], index) => (
        <ViewSlot
          key={index}
          slot={slot}
          cx={Number(column) + 0.5}
          cy={Number(row) + 0.5}
          r={0.3}
        />
      ))}
    </svg>
  )
}
