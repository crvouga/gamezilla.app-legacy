import * as Alerts from "../../Alerts"
import { Cmd, exhaustive } from "../../Core"
import * as ProfileStore from "../../Profile/Profile.Store"
import { Ctx, GameRoomCtx, viewSelectModeScreen } from "../Game"
import { viewCoverArt } from "./TicTacToe/TicTacToe"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend
} from "./TicTacToe.Types"
import * as UserVsBot from "./UserVsBot/UserVsBot.Frontend"
import * as VsUser from "./VsUser/VsUser.Frontend"

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

    case "VsUser": {
      if (model.mode === "VsUser") {
        const [child, cmd] = VsUser.update(
          {
            sendToBackend: (msg) => sendToBackend(["VsUser", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ mode: "VsUser", child }, Cmd.tag("VsUser", cmd)]
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

    case "VsUser": {
      if (model.mode === "VsUser") {
        const [child, actions] = VsUser.updateFromBackend(
          { ctx, },
          msg[1],
          model.child,
        )
        return [{ mode: "VsUser", child }, Cmd.None, actions]
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
    case "VsUser": {
      const frontendModelChild =
        frontendModel.mode === "VsUser"
          ? frontendModel.child
          : VsUser.init

      return {
        mode: "VsUser",
        child: VsUser.mergeWithBackend(
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
          coverArt: viewCoverArt(),
          onVsUser: () => $d([
            "InputMode",
            { mode: "VsUser", userId: ctx.currentUserId },
          ]),
          onUserVsComputer: () => $d([
            "InputMode",
            { mode: "UserVsBot", userId: ctx.currentUserId },
          ])
        })
      )
    }

    case "VsUser": {
      return (
        <VsUser.View
          onCloseGame={() => {
            $d(["InputMode", { mode: "None", userId: ctx.currentUserId }])
          }}
          ctx={ctx}
          model={model.child}
          $d={(msg) => $d(["VsUser", msg])}
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
