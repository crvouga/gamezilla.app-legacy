import { useRef } from "react"
import * as Alerts from "../../Alerts"
import { Cmd, Uuid } from "../../Core"
import * as UI from "../../UI"
import { bannerArtAspectRatio, Ctx, viewSelectModeScreen, GameRoomCtx } from "../Game.Shared"
import { COLUMN_COUNT, gameTheme, MAX_COLUMN_HEIGHT } from "./ConnectFour"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend
} from "./ConnectFour.Types"
import * as UserVsBot from "./UserVsBot/UserVsBot.Frontend"
import * as UserVsUser from "./UserVsUser/UserVsUser.Frontend"
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
    case "UserVsUser": {
      if (model.type === "UserVsUser") {
        const [child, cmd] = UserVsUser.update(
          {
            sendToBackend: (msg) => sendToBackend(["UserVsUser", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ type: "UserVsUser", child }, Cmd.tag("UserVsUser", cmd)]
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

    case "UserVsUser": {
      if (model.type === "UserVsUser") {
        const [child, cmd, actions] = UserVsUser.updateFromBackend(
          msg[1],
          model.child,
        )
        return [
          { type: "UserVsUser", child },
          Cmd.tag("UserVsUser", cmd),
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
          coverArt: CoverArt(),
          title: "Connect Four",
          onUserVsUser: () =>
            $d([
              "InputMode",
              { mode: "UserVsUser", userId: ctx.currentUserId },
            ]),
          onUserVsComputer: () =>
            $d([
              "InputMode",
              { mode: "UserVsBot", userId: ctx.currentUserId },
            ])
        })
      )
    }

    case "UserVsUser": {
      return (
        <UserVsUser.View
          ctx={ctx}
          $d={(msg) => $d(["UserVsUser", msg])}
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

export const CoverArt = () => {
  const ref = useRef(Uuid.generateSync())
  const ids = {
    playerOneGradient: `playerOneGradient${ref.current}`,
    playerTwoGradient: `playerTwoGradient${ref.current}`,
    holePattern: `holePattern${ref.current}`,
    columnGradient: `columnGradient${ref.current}`,
    holeMask: `holeMask${ref.current}`,
  }

  const playerOneFill = `url(#${ids.playerOneGradient})`
  const playerTwoFill = `url(#${ids.playerTwoGradient})`

  return (
    <svg width="100%" viewBox={"0 0 2 2"}>
      <defs>
        <pattern
          id={ids.holePattern}
          patternUnits="userSpaceOnUse"
          width={1}
          height={1}
        >
          <circle cx={0.5} cy={0.5} r={0.425} fill="black"></circle>
        </pattern>

        <mask id={ids.holeMask}>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill="white"
          ></rect>
          <rect
            x={0}
            y={0}
            width={COLUMN_COUNT}
            height={MAX_COLUMN_HEIGHT}
            fill={`url(#${ids.holePattern})`}
          ></rect>
        </mask>

        <linearGradient id={ids.columnGradient} gradientTransform="rotate(90)">
          <stop offset="0%" stopColor={gameTheme.primary.light} />
          <stop offset="100%" stopColor={gameTheme.primary.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerOneGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={gameTheme.PlayerOne.light} />
          <stop offset="100%" stopColor={gameTheme.PlayerOne.dark} />
        </linearGradient>

        <linearGradient
          id={ids.playerTwoGradient}
          gradientTransform="rotate(90)"
        >
          <stop offset="0%" stopColor={gameTheme.PlayerTwo.light} />
          <stop offset="100%" stopColor={gameTheme.PlayerTwo.dark} />
        </linearGradient>
      </defs>

      <rect x={0} y={0} width={2} height={2} fill={gameTheme.primary.darker} />

      <circle cx={0.5} cy={0} r={0.5} fill={playerOneFill} />

      <circle cx={1.5} cy={0.5} r={0.5} fill={playerTwoFill} />

      <circle cx={1.5} cy={1.5} r={0.5} fill={playerOneFill} />

      <circle cx={0.5} cy={1.5} r={0.5} fill={playerTwoFill} />

      <rect
        x={0}
        y={0}
        width={COLUMN_COUNT}
        height={MAX_COLUMN_HEIGHT}
        fill={`url(#${ids.columnGradient})`}
        mask={`url(#${ids.holeMask})`}
      />
    </svg>
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

    case "UserVsUser": {
      if (frontendModel.type === "UserVsUser") {
        return {
          type: "UserVsUser",
          child: UserVsUser.mergeWithBackend({
            frontendModel: frontendModel.child,
            backendModel: backendModel.child,
          }),
        }
      }

      return {
        type: "UserVsUser",
        child: UserVsUser.mergeWithBackend({
          frontendModel: UserVsUser.init(backendModel.child),
          backendModel: backendModel.child,
        }),
      }
    }
  }
}
