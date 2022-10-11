import { Cmd, exhaustive, tagCmd } from "../../Core"
import { UserId } from "../../Data"
import * as Store from "../../Store"
import * as UI from "../../UI"
import { GameModeCard } from "../Views"
import { Position, Slot, gameTheme, ViewSlot } from "./TicTacToe"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend,
} from "./TicTacToe.Types"
import * as UserVsBot from "./UserVsBot/UserVsBot.Frontend"
import * as UserVsUser from "./UserVsUser/UserVsUser.Frontend"
import { BannerArt } from "./Views"

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

export type OutAction = Store.Action

export const update = (
  {
    currentUserId,
    sendToBackend,
  }: {
    currentUserId: UserId.UserId
    sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode": {
      return [model, sendToBackend(msg)]
    }

    case "UserVsUser": {
      if (model.mode === "UserVsUser") {
        const [child, cmd] = UserVsUser.update(
          {
            currentUserId,
            sendToBackend: (msg) => sendToBackend(["UserVsUser", msg]),
          },
          msg[1],
          model.child,
        )
        return [{ mode: "UserVsUser", child }, tagCmd("UserVsUser", cmd)]
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
        return [{ mode: "UserVsBot", child }, tagCmd("UserVsBot", cmd)]
      }
      return [model, Cmd.None]
    }

    default: {
      return exhaustive(msg[0])
    }
  }
}

export const updateFromBackend = (
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {
    case "InputMode_Done": {
      const result = msg[1]

      if (result.type === "Err") {
        return [model, Cmd.None]
      }

      const modelNew = mergeWithBackend(model, result.value)

      return [modelNew, Cmd.None]
    }

    case "UserVsUser": {
      if (model.mode === "UserVsUser") {
        const [child, cmd] = UserVsUser.updateFromBackend(msg[1], model.child)
        return [{ mode: "UserVsUser", child }, tagCmd("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.mode === "UserVsBot") {
        const [child, cmd] = UserVsBot.updateFromBackend(msg[1], model.child)
        return [{ mode: "UserVsBot", child }, tagCmd("UserVsBot", cmd)]
      }

      return [model, Cmd.None]
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

const iconSize = 58

export const View = ({
  currentUserId,
  store,
  model,
  dispatch,
  onCloseGame,
  goHome,
  roomAvatarGroup,
}: {
  currentUserId: UserId.UserId
  store: Store.Model
  model: Model
  dispatch: (msg: Msg) => void
  onCloseGame: () => void
  goHome: () => void
  roomAvatarGroup: UI.ViewNode
}) => {
  const homeButton = (
    <UI.IconButton
      sx={{ marginLeft: -1 }}
      onClick={goHome}
    >
      <UI.Icons.Home />
    </UI.IconButton>
  )

  switch (model.mode) {
    case "None": {
      return (
        <UI.FillBox>
          <UI.Header
            left={homeButton}
            title=""
            right={roomAvatarGroup}
          />
          <BannerArt title="Tic Tac Toe" />
          <UI.Box sx={{ flex: 1, padding: 2, gap: 2, display: "flex" }}>
            <UI.Box sx={{ width: "50%" }}>
              <GameModeCard
                leftIcon={
                  <UI.Icons.Person sx={{ width: iconSize, height: iconSize }} />
                }
                rightIcon={
                  <UI.Icons.Person sx={{ width: iconSize, height: iconSize }} />
                }
                title="Vs User"
                onClick={() =>
                  dispatch([
                    "InputMode",
                    { mode: "UserVsUser", userId: currentUserId },
                  ])
                }
              />
            </UI.Box>
            <UI.Box sx={{ width: "50%" }}>
              <GameModeCard
                leftIcon={
                  <UI.Icons.Person sx={{ width: iconSize, height: iconSize }} />
                }
                rightIcon={
                  <UI.Icons.SmartToy
                    sx={{ width: iconSize, height: iconSize }}
                  />
                }
                title="Vs Bot"
                onClick={() =>
                  dispatch([
                    "InputMode",
                    { mode: "UserVsBot", userId: currentUserId },
                  ])
                }
              />
            </UI.Box>
          </UI.Box>
          <UI.Box sx={{ padding: 2 }}>
            <UI.Button
              fullWidth
              variant="outlined"
              onClick={onCloseGame}
            >
              Close
            </UI.Button>
          </UI.Box>
        </UI.FillBox>
      )
    }

    case "UserVsUser": {
      return (
        <UserVsUser.View
          onCloseGame={() => {
            dispatch(["InputMode", { mode: "None", userId: currentUserId }])
          }}
          currentUserId={currentUserId}
          store={store}
          model={model.child}
          dispatch={(msg) => dispatch(["UserVsUser", msg])}
          goHome={goHome}
          roomAvatarGroup={roomAvatarGroup}
        />
      )
    }

    case "UserVsBot": {
      return (
        <UserVsBot.View
          goBack={() => {
            dispatch(["InputMode", { mode: "None", userId: currentUserId }])
          }}
          currentUserId={currentUserId}
          store={store}
          model={model.child}
          dispatch={(msg) => dispatch(["UserVsBot", msg])}
          goHome={goHome}
          roomAvatarGroup={roomAvatarGroup}
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
    [{ row: 0, column: 1 }, "Empty"],
    [{ row: 1, column: 0 }, "Empty"],
    [{ row: 1, column: 1 }, "O"],
  ]

  const LINES = [
    { x1: 1, y1: 0, x2: 1, y2: 3 },
    { x1: 0, y1: 1, x2: 3, y2: 1 },
  ] as const

  return (
    <svg
      width="100%"
      viewBox="0 0 2 2"
    >
      <rect
        x={0}
        y={0}
        width={2}
        height={2}
        fill={gameTheme.background}
      />

      {LINES.map((line, index) => (
        <line
          key={index}
          {...line}
          stroke={gameTheme.line}
          strokeWidth={0.1}
        />
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
