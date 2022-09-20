import { Audio, Cmd, Option, pipe, RemoteData, Result, Sub, tagCmd, Unit } from "../../Core"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  inputModeProblemToString,
  ToBackend,
  ToFrontend,
} from "./Chess.Types"
import * as UserVsUser from "./UserVsUser/UserVsUser.Frontend"
import * as UserVsBot from "./UserVsBot/UserVsBot.Frontend"
import * as Store from "../../Store"
import * as Snackbar from "../../Snackbar"
import * as UI from "../../UI"
import { UserId } from "../../Data"
import { ReactNode } from "react"
import * as Sounds from "./Sounds"

//
//
//
// Model
//
//
//

export type Model = FrontendModel

export const init = ({
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
}): [FrontendModel, Cmd.Cmd<Msg>] => {
  return [
    {
      mode: ["None"],
      requests: {
        InputMode: RemoteData.NotAsked
      }
    },
    Audio.preload(Object.values(Sounds), (): Msg => ['PreloadAudio_Done'])
  ]
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
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd.Cmd<never> },
  msg: Msg,
  model: Model,
): [Model, Cmd.Cmd<Msg>] => {
  switch (msg[0]) {

    case 'PreloadAudio_Done': {
      return [model, Cmd.None]
    }

    case "InputMode": {
      return [{ ...model, requests: { ...model.requests, InputMode: RemoteData.Loading } }, sendToBackend(msg)]
    }

    case "UserVsUser": {
      if (model.mode[0] === "UserVsUser") {
        const [child, cmd] = UserVsUser.update(
          { sendToBackend: (msg) => sendToBackend(["UserVsUser", msg]) },
          msg[1],
          model.mode[1],
        )

        return [{ ...model, mode: ["UserVsUser", child] }, tagCmd("UserVsUser", cmd)]
      }

      return [model, Cmd.None]
    }

    case "UserVsBot": {
      if (model.mode[0] === "UserVsBot") {
        const [child, cmd] = UserVsBot.update(
          { sendToBackend: (msg) => sendToBackend(["UserVsBot", msg]) },
          msg[1],
          model.mode[1],
        )

        return [{ ...model, mode: ["UserVsBot", child] }, tagCmd("UserVsBot", cmd)]
      }

      return [model, Cmd.None]
    }
  }
}

export const updateFromBackend = (
  { currentUserId, sendToBackend, store }: { currentUserId: UserId.UserId, sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>, store: Store.Model },
  msg: ToFrontend,
  model: Model,
): [Model, Cmd.Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "InputMode_Done": {
      const result = msg[2]

      const modelNew: Model = {
        ...model,
        requests: {
          ...model.requests,
          InputMode: pipe(result, RemoteData.fromResult, RemoteData.map(() => Unit))
        }
      }

      if (result.type === "Err") {
        return [modelNew, Cmd.None, []]
      }

      const [merged, mergedCmd] = mergeWithBackend({
        frontendModel: modelNew,
        backendModel: result.value,
        sendToBackend,
      })

      return [merged, mergedCmd, []]
    }

    case "UserVsUser": {
      if (model.mode[0] === "UserVsUser") {
        const [child, cmd, actions] = UserVsUser.updateFromBackend({ currentUserId, store }, msg[1], model.mode[1])

        return [{ ...model, mode: ["UserVsUser", child] }, tagCmd("UserVsUser", cmd), actions]
      }

      return [model, Cmd.None, []]
    }

    case "UserVsBot": {
      if (model.mode[0] === "UserVsBot") {
        const [child, cmd, actions] = UserVsBot.updateFromBackend(
          msg[1],
          model.mode[1],
        )

        return [{ ...model, mode: ["UserVsBot", child] }, tagCmd("UserVsBot", cmd), actions]
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

export const subscriptions = (model: Model): Sub.Sub<Msg> => {
  return Sub.None
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
  roomAvatarGroup,
  currentUserId,
  store,
  model,
  dispatch,
  onCloseGame,
}: {
  onCloseGame: () => void
  currentUserId: UserId.UserId
  store: Store.Model
  model: Model
  dispatch: (msg: Msg) => void
  roomAvatarGroup: UI.ViewNode
}) => {
  const backButton = (
    <UI.Tooltip title={model.requests.InputMode.type === 'Failure' ? inputModeProblemToString(model.requests.InputMode.problem) : ""}>
      <UI.Button
        size="large"
        sx={{ marginLeft: -1 }}
        loading={model.requests.InputMode.type === 'Loading'}
        onClick={() => dispatch(["InputMode", { mode: "None", userId: currentUserId }])}
      >
        Back
      </UI.Button>
    </UI.Tooltip>
  )

  switch (model.mode[0]) {
    case "None": {
      const tooltipTitle =
        model.requests.InputMode.type === 'Failure'
          ? inputModeProblemToString(model.requests.InputMode.problem)
          : model.requests.InputMode.type === 'Loading'
            ? "Loading..."
            : ""

      return (
        <UI.FillBox>
          <UI.Header
            left={
              <UI.Button
                onClick={onCloseGame}
                sx={{ marginLeft: -1 }}
              >
                Close
              </UI.Button>
            }
            title="Chess"
            right={roomAvatarGroup}
          />

          <UI.Box sx={{ display: "flex", gap: 2, padding: 2 }}>
            <UI.Tooltip title={tooltipTitle}>
              <UI.Box sx={{ width: "50%" }}>
                <ModeSelectCard
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
            </UI.Tooltip>

            <UI.Tooltip title={tooltipTitle}>
              <UI.Box sx={{ width: "50%" }}>
                <ModeSelectCard
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
            </UI.Tooltip>
          </UI.Box>
        </UI.FillBox>
      )
    }

    case "UserVsBot": {
      return (
        <UserVsBot.View
          currentUserId={currentUserId}
          dispatch={(msg) => dispatch(["UserVsBot", msg])}
          model={model.mode[1]}
          store={store}
          backButton={backButton}
          roomAvatarGroup={roomAvatarGroup}
        />
      )
    }

    case "UserVsUser": {
      return (
        <UserVsUser.View
          currentUserId={currentUserId}
          store={store}
          model={model.mode[1]}
          dispatch={(msg) => dispatch(["UserVsUser", msg])}
          roomAvatarGroup={roomAvatarGroup}
          backButton={backButton}
        />
      )
    }
  }
}

const ModeSelectCard = ({
  leftIcon,
  rightIcon,
  title,
  onClick,
}: {
  leftIcon: ReactNode
  rightIcon: ReactNode
  title: string
  onClick: () => void
}) => {
  const theme = UI.useTheme()
  return (
    <UI.CardActionArea onClick={onClick}>
      <UI.AspectRatio aspectRatio={1}>
        <UI.Card
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <UI.Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              marginBottom: 1,
            }}
          >
            {leftIcon}
            {rightIcon}
          </UI.Box>
          <UI.Typography variant="h5">{title}</UI.Typography>
        </UI.Card>
      </UI.AspectRatio>
    </UI.CardActionArea>
  )
}

//
//
//
// View Cover Art
//
//
//

export const theme = {
  // lightSquare: "#EBEBD0",
  // darkSquare: "#779455",
  lightSquare: "#7C6141",
  darkSquare: "#533F30",
  pawn: "#93BA46",
}

export const CoverArt = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 2 2"
    >
      <rect
        x={0}
        y={0}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={0}
        y={1}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />

      <rect
        x={1}
        y={1}
        width={1}
        height={1}
        fill={theme.lightSquare}
      />

      <rect
        x={1}
        y={0}
        width={1}
        height={1}
        fill={theme.darkSquare}
      />

      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="2"
        height="2"
        viewBox="0 0 45 45"
      >
        <g
          transform="translate(0 -2) scale(0.8)"
          style={{ transformOrigin: "center" }}
        >
          <path
            fill={theme.pawn}
            stroke={theme.pawn}
            strokeLinecap="round"
            strokeWidth="1.5"
            d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"
          ></path>
        </g>
      </svg>
    </svg>
  )
}

//
//
//
//
//
//

export const mergeWithBackend = ({
  frontendModel,
  backendModel,
  sendToBackend,
}: {
  sendToBackend: (msg: ToBackend) => Cmd.Cmd<never>
  frontendModel: FrontendModel
  backendModel: BackendModel
}): [FrontendModel, Cmd.Cmd<Msg>] => {
  switch (backendModel[0]) {
    case "None": {
      return [{ ...frontendModel, mode: ["None"] }, Cmd.None]
    }

    case "UserVsUser": {
      if (frontendModel.mode[0] === "UserVsUser") {
        return [
          {
            ...frontendModel,
            mode: [
              "UserVsUser",
              UserVsUser.mergeWithBackend(frontendModel.mode[1], backendModel[1]),
            ]
          },
          Cmd.None,
        ]
      }

      const [child, childCmd] = UserVsUser.init({
        userId: Option.None,
        sendToBackend: (msg) => sendToBackend(["UserVsUser", msg]),
      })

      return [
        { ...frontendModel, mode: ["UserVsUser", UserVsUser.mergeWithBackend(child, backendModel[1])] },
        tagCmd("UserVsUser", childCmd),
      ]
    }

    case "UserVsBot": {
      if (frontendModel.mode[0] === "UserVsBot") {
        return [
          {
            ...frontendModel,
            mode: [
              "UserVsBot",
              UserVsBot.mergeWithBackend(frontendModel.mode[1], backendModel[1]),
            ]
          },
          Cmd.None,
        ]
      }

      const [child, childCmd] = UserVsBot.init({
        sendToBackend: (msg) => sendToBackend(["UserVsBot", msg]),
      })

      return [
        { ...frontendModel, mode: ["UserVsBot", UserVsBot.mergeWithBackend(child, backendModel[1])] },
        tagCmd("UserVsBot", childCmd),
      ]
    }
  }
}
