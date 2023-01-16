import { Alerts } from "@gamezilla/alerts"
import { Cmd, Sub } from "@gamezilla/core"
import { bannerArtAspectRatio, Ctx, GameRoomCtx, viewSelectModeScreen } from "@gamezilla/game-shared"
import * as UI from "@gamezilla/ui"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend
} from "./connect-four.types"
import { gameTheme, PlayerIcon, viewCoverArt } from "./connect-four/connect-four-view"
import * as VsBot from "./vs-bot/vs-bot.frontend"
import * as VsUser from "./vs-user/vs-user.frontend"


//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init: Model = { type: "none" }

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
    case "input-mode": {
      return [model, sendToBackend(msg)]
    }
    case "vs-user": {
      if (model.type === "vs-user") {
        const [child, cmd] = VsUser.update(
          {
            sendToBackend: (msg) => sendToBackend(["vs-user", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ type: "vs-user", child }, Cmd.tag("vs-user", cmd)]
      }
      return [model, Cmd.None]
    }

    case "vs-bot": {
      if (model.type === "vs-bot") {
        const [child, cmd] = VsBot.update(
          {
            sendToBackend: (msg) => sendToBackend(["vs-bot", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ type: "vs-bot", child }, Cmd.tag("vs-bot", cmd)]
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
    case "input-mode-done": {
      const merged = mergeWithBackend({
        frontendModel: model,
        backendModel: msg[1],
      })
      return [merged, Cmd.None, []]
    }

    case "vs-user": {
      if (model.type === "vs-user") {
        const [child, cmd, actions] = VsUser.updateFromBackend(
          msg[1],
          model.child,
        )
        return [
          { type: "vs-user", child },
          Cmd.tag("vs-user", cmd),
          actions,
        ]
      }
      return [model, Cmd.None, []]
    }

    case "vs-bot": {
      if (model.type === "vs-bot") {
        const [child, cmd, actions] = VsBot.updateFromBackend(
          msg[1],
          model.child,
        )
        return [
          { type: "vs-bot", child },
          Cmd.tag("vs-bot", cmd),
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
  $send,
  ctx,
  gameRoomCtx,
}: {
  model: Model
  $send: (msg: Msg) => void
  ctx: Ctx
  gameRoomCtx: GameRoomCtx
}) => {
  const goBack = () =>
    $send(["input-mode", { userId: ctx.currentUserId, mode: "none" }])

  switch (model.type) {
    case "none": {
      return (
        viewSelectModeScreen({
          ctx: ctx,
          gameRoomCtx: gameRoomCtx,
          coverArt: viewCoverArt(),
          title: "Connect Four",
          onVsUser: () =>
            $send([
              "input-mode",
              { mode: "vs-user", userId: ctx.currentUserId },
            ]),
          onUserVsComputer: () =>
            $send([
              "input-mode",
              { mode: "vs-bot", userId: ctx.currentUserId },
            ])
        })
      )
    }

    case "vs-user": {
      return (
        <VsUser.View
          ctx={ctx}
          $send={(msg) => $send(["vs-user", msg])}
          goBack={goBack}
          model={model.child}
        />
      )
    }

    case "vs-bot": {
      return (
        <VsBot.View
          ctx={ctx}
          $send={(msg) => $send(["vs-bot", msg])}
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
    case "none": {
      return backendModel
    }

    case "vs-bot": {
      if (frontendModel.type === "vs-bot") {
        return {
          type: "vs-bot",
          child: VsBot.mergeWithBackend({
            frontendModel: frontendModel.child,
            backendModel: backendModel.child,
          }),
        }
      }

      return {
        type: "vs-bot",
        child: VsBot.mergeWithBackend({
          frontendModel: VsBot.init(backendModel.child),
          backendModel: backendModel.child,
        }),
      }
    }

    case "vs-user": {
      if (frontendModel.type === "vs-user") {
        return {
          type: "vs-user",
          child: VsUser.mergeWithBackend({
            frontendModel: frontendModel.child,
            backendModel: backendModel.child,
          }),
        }
      }

      return {
        type: "vs-user",
        child: VsUser.mergeWithBackend({
          frontendModel: VsUser.init(backendModel.child),
          backendModel: backendModel.child,
        }),
      }
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

export const subscriptions = (model: Model): Sub<Msg> => {
  switch (model.type) {
    case "none": {
      return Sub.None
    }

    case "vs-bot": {
      return Sub.tag("vs-bot", VsBot.subscriptions(model.child))
    }

    case "vs-user": {
      return Sub.tag("vs-user", VsUser.subscriptions(model.child))
    }
  }
}