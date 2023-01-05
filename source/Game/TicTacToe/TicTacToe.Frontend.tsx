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
  mode: "none",
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
    case "input-mode": {
      return [model, sendToBackend(msg)]
    }

    case "vs-user": {
      if (model.mode === "vs-user") {
        const [child, cmd] = VsUser.update(
          {
            sendToBackend: (msg) => sendToBackend(["vs-user", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ mode: "vs-user", child }, Cmd.tag("vs-user", cmd)]
      }
      return [model, Cmd.None]
    }

    case "vs-bot": {
      if (model.mode === "vs-bot") {
        const [child, cmd] = VsBot.update(
          {
            // currentUserId,
            sendToBackend: (msg) => sendToBackend(["vs-bot", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ mode: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
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
    case "input-mode-done": {
      const result = msg[1]

      if (result.type === "Err") {
        return [model, Cmd.None, []]
      }

      const modelNew = mergeWithBackend(model, result.value)

      return [modelNew, Cmd.None, []]
    }

    case "vs-user": {
      if (model.mode === "vs-user") {
        const [child, actions] = VsUser.updateFromBackend(
          { ctx, },
          msg[1],
          model.child,
        )
        return [{ mode: "vs-user", child }, Cmd.None, actions]
      }

      return [model, Cmd.None, []]
    }

    case "vs-bot": {
      if (model.mode === "vs-bot") {
        const [child, cmd, actions] = VsBot.updateFromBackend(
          msg[1],
          model.child,
        )
        return [
          { mode: "vs-bot", child },
          Cmd.tag("vs-bot", cmd),
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
    case "none": {
      return {
        mode: "none",
      }
    }
    case "vs-user": {
      const frontendModelChild =
        frontendModel.mode === "vs-user"
          ? frontendModel.child
          : VsUser.init

      return {
        mode: "vs-user",
        child: VsUser.mergeWithBackend(
          frontendModelChild,
          backendModel.child,
        ),
      }
    }

    case "vs-bot": {
      const frontendModelChild =
        frontendModel.mode === "vs-bot"
          ? frontendModel.child
          : VsBot.init({ userId: "none" })

      return {
        mode: "vs-bot",
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
    case "none": {
      return (
        viewSelectModeScreen({
          title: "Tic-Tac-Toe",
          ctx,
          gameRoomCtx,
          coverArt: viewCoverArt(),
          onVsUser: () => $send([
            "input-mode",
            { mode: "vs-user", userId: ctx.currentUserId },
          ]),
          onUserVsComputer: () => $send([
            "input-mode",
            { mode: "vs-bot", userId: ctx.currentUserId },
          ])
        })
      )
    }

    case "vs-user": {
      return (
        <VsUser.View
          onCloseGame={() => {
            $send(["input-mode", { mode: "none", userId: ctx.currentUserId }])
          }}
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(["vs-user", msg])}
        />
      )
    }

    case "vs-bot": {
      return (
        <VsBot.View
          goBack={() => {
            $send(["input-mode", { mode: "none", userId: ctx.currentUserId }])
          }}
          ctx={ctx}
          model={model.child}
          $send={(msg) => $send(["vs-bot", msg])}
        />
      )
    }
  }
}
