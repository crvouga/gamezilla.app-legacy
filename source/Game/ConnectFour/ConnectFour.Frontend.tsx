import * as Alerts from "../../Alerts"
import { Cmd } from "../../Core"
import * as UI from "../../UI"
import { bannerArtAspectRatio, Ctx, GameRoomCtx, viewSelectModeScreen } from "../Game"
import { gameTheme, viewCoverArt } from "./ConnectFour"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend
} from "./ConnectFour.Types"
import * as UserVsBot from "./UserVsBot/UserVsBot.Frontend"
import * as VsUser from "./VsUser/VsUser.Frontend"
import { PlayerIcon } from "./Views"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = { type: "None" }

//
//
//
// Update
//
//
//

export type Msg = FrontendMsg

type OutAction = Alerts.Action

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      return [model, sendToBackend(msg)]
    }
    case "VsUser": {
      if (model.type === "VsUser") {
        const [child, cmd] = VsUser.update(
          {
            sendToBackend: (msg) => sendToBackend(["VsUser", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ type: "VsUser", child }, Cmd.tag("VsUser", cmd)]
      }
      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.type === "UserVsBot") {
        const [child, cmd] = UserVsBot.update(
          {
            sendToBackend: (msg) => sendToBackend(["UserVsBot", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ type: "UserVsBot", child }, Cmd.tag("UserVsBot", cmd)]
      }
      return [model, Cmd.None]
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "InputMode_Done": {
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1],
      })
      return [merged, Cmd.None, []]
    }

    case "VsUser": {
      if (model.type === "VsUser") {
        const [child, cmd, actions] = VsUser.updateFromBackend(
          msg[1],
          model.child,
        )
        return [
          { type: "VsUser", child },
          Cmd.tag("VsUser", cmd),
          actions,
        ]
      }
      return [model, Cmd.None, []]
    }

    case "UserVsBot": {
      if (model.type === "UserVsBot") {
        const [child, cmd, actions] = UserVsBot.updateFromBackend(
          msg[1],
          model.child,
        )
        return [
          { type: "UserVsBot", child },
          Cmd.tag("UserVsBot", cmd),
          actions,
        ]
      }
      return [model, Cmd.None, []]
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
  model,
  $d,
  ctx,
  gameRoomCtx,
}: {
  model: Model
  $d: (msg: Msg) => void
  ctx: Ctx
  gameRoomCtx: GameRoomCtx
}) => {
  const goBack = () =>
    $d(["InputMode", { userId: ctx.currentUserId, mode: "None" }])

  switch (model.type) {
    case "None": {
      return (
        viewSelectModeScreen({
          ctx: ctx,
          gameRoomCtx: gameRoomCtx,
          coverArt: viewCoverArt(),
          title: "Connect Four",
          onVsUser: () =>
            $d([
              "InputMode",
              { mode: "VsUser", userId: ctx.currentUserId },
            ]),
          onUserVsComputer: () =>
            $d([
              "InputMode",
              { mode: "UserVsBot", userId: ctx.currentUserId },
            ])
        })
      )
    }

    case "VsUser": {
      return (
        <VsUser.View
          ctx={ctx}
          $d={(msg) => $d(["VsUser", msg])}
          goBack={goBack}
          model={model.child}
        />
      )
    }

    case "UserVsBot": {
      return (
        <UserVsBot.View
          ctx={ctx}
          $d={(msg) => $d(["UserVsBot", msg])}
          model={model.child}
          goBack={goBack}
        />
      )
    }
  }
}

//
//
//
// Art
//
//
//

export const BannerArt = () => {
  const iconSx: UI.Sx = { width: 120, height: 120, maxHeight: "66%" }

  return (
    <UI.AspectRatio aspectRatio={bannerArtAspectRatio}>
      <UI.List
        sx={{
          width: "100%",
          height: "100%",
          background: `linear-gradient(${gameTheme.primary.dark}, ${gameTheme.primary.darker})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <PlayerIcon playerType="PlayerOne" sx={iconSx} />
        <PlayerIcon playerType="PlayerTwo" sx={iconSx} />
      </UI.List>
      <UI.List
        sx={{
          width: "100%",
          height: "100%",
          background: "rgba(0, 0, 0, 0.1)",
          position: "absolute",
          top: 0,
          left: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <UI.Typography
          color="#fff"
          fontSize={36}
          sx={{ paddingX: 2, paddingY: 1 }}
        >
          Connect Four
        </UI.Typography>
      </UI.List>
    </UI.AspectRatio>
  )
}

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
}: {
  frontendModel: FrontendModel
  backendModel: BackendModel
}): FrontendModel => {
  switch (backendModel.type) {
    case "None": {
      return backendModel
    }

    case "UserVsBot": {
      if (frontendModel.type === "UserVsBot") {
        return {
          type: "UserVsBot",
          child: UserVsBot.mergeWithBackend({
            frontendModel: frontendModel.child,
            backendModel: backendModel.child,
          }),
        }
      }

      return {
        type: "UserVsBot",
        child: UserVsBot.mergeWithBackend({
          frontendModel: UserVsBot.init(backendModel.child),
          backendModel: backendModel.child,
        }),
      }
    }

    case "VsUser": {
      if (frontendModel.type === "VsUser") {
        return {
          type: "VsUser",
          child: VsUser.mergeWithBackend({
            frontendModel: frontendModel.child,
            backendModel: backendModel.child,
          }),
        }
      }

      return {
        type: "VsUser",
        child: VsUser.mergeWithBackend({
          frontendModel: VsUser.init(backendModel.child),
          backendModel: backendModel.child,
        }),
      }
    }
  }
}
