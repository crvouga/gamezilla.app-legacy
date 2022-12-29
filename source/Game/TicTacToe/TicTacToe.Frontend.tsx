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
import * as VsBot from "./VsBot/VsBot.Frontend"
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

    case "VsBot": {
      if (model.mode === "VsBot") {
        const [child, cmd] = VsBot.update(
          {
            // currentUserId,
            sendToBackend: (msg) => sendToBackend(["VsBot", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ mode: "VsBot", child }, Cmd.tag("VsBot", cmd)]
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

    case "VsBot": {
      if (model.mode === "VsBot") {
        const [child, cmd, actions] = VsBot.updateFromBackend(
          msg[1],
          model.child,
        )
        return [
          { mode: "VsBot", child },
          Cmd.tag("VsBot", cmd),
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

    case "VsBot": {
      const frontendModelChild =
        frontendModel.mode === "VsBot"
          ? frontendModel.child
          : VsBot.init({ userId: "None" })

      return {
        mode: "VsBot",
        child: VsBot.mergeWithBackend(
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
  $send,
  gameRoomCtx
}: {
  ctx: Ctx
  model: Model
  $send: (msg: Msg) => void
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
          onVsUser: () => $send([
            "InputMode",
            { mode: "VsUser", userId: ctx.currentUserId },
          ]),
          onUserVsComputer: () => $send([
            "InputMode",
            { mode: "VsBot", userId: ctx.currentUserId },
          ])
        })
      )
    }

    case "VsUser": {
      return (
        <VsUser.View
          onCloseGame={() => {
            $send(["InputMode", { mode: "None", userId: ctx.currentUserId }])
          }}
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(["VsUser", msg])}
        />
      )
    }

    case "VsBot": {
      return (
        <VsBot.View
          goBack={() => {
            $send(["InputMode", { mode: "None", userId: ctx.currentUserId }])
          }}
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(["VsBot", msg])}
        />
      )
    }
  }
}
