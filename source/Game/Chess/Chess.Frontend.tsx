import * as Alerts from "../../Alerts"
import { Audio, Cmd, p, RemoteData, Sub, Unit } from "../../Core"
import { Ctx, GameModeSelectPage, GameRoomCtx } from "../Game.Shared"
import {
  BackendModel,
  FrontendModel,
  FrontendMsg,
  ToBackend,
  ToFrontend
} from "./Chess.Types"
import * as Sounds from "./Sounds"
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

export const init = ({ }: // sendToBackend,
  {
    sendToBackend: (msg: ToBackend) => Cmd
  }): [FrontendModel, Cmd<Msg>] => {
  return [
    {
      mode: ["None"],
      requests: {
        InputMode: RemoteData.NotAsked,
      },
    },
    Audio.preload(Object.values(Sounds), (): Msg => ["PreloadAudio_Done"]),
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

export type OutAction = Alerts.Action

export const update = (
  { sendToBackend }: { sendToBackend: (msg: ToBackend) => Cmd },
  msg: Msg,
  model: Model,
): [Model, Cmd<Msg>] => {
  switch (msg[0]) {
    case "PreloadAudio_Done": {
      return [model, Cmd.None]
    }

    case "InputMode": {
      return [
        {
          ...model,
          requests: { ...model.requests, InputMode: RemoteData.Loading },
        },
        sendToBackend(msg),
      ]
    }

    case "UserVsUser": {
      if (model.mode[0] === "UserVsUser") {
        const [child, cmd] = UserVsUser.update(
          { sendToBackend: (msg) => sendToBackend(["UserVsUser", msg]) },
          msg[1],
          model.mode[1],
        )

        return [
          { ...model, mode: ["UserVsUser", child] },
          Cmd.tag("UserVsUser", cmd),
        ]
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

        return [
          { ...model, mode: ["UserVsBot", child] },
          Cmd.tag("UserVsBot", cmd),
        ]
      }

      return [model, Cmd.None]
    }
  }
}

export const updateFromBackend = (
  {
    ctx,
    sendToBackend,
  }: {
    sendToBackend: (msg: ToBackend) => Cmd
    ctx: Ctx
  },
  msg: ToFrontend,
  model: Model,
): [Model, Cmd<Msg>, OutAction[]] => {
  switch (msg[0]) {
    case "InputMode_Done": {
      const result = msg[2]

      const modelNew: Model = {
        ...model,
        requests: {
          ...model.requests,
          InputMode: p(
            result,
            RemoteData.map(() => Unit),
          ),
        },
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
        const [child, cmd, actions] = UserVsUser.updateFromBackend(
          { ctx },
          msg[1],
          model.mode[1],
        )

        return [
          { ...model, mode: ["UserVsUser", child] },
          Cmd.tag("UserVsUser", cmd),
          actions,
        ]
      }

      return [model, Cmd.None, []]
    }

    case "UserVsBot": {
      if (model.mode[0] === "UserVsBot") {
        const [child, cmd, actions] = UserVsBot.updateFromBackend(
          msg[1],
          model.mode[1],
        )

        return [
          { ...model, mode: ["UserVsBot", child] },
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
// Subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None
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
  switch (model.mode[0]) {
    case "None": {
      return (
        <GameModeSelectPage
          ctx={ctx}
          gameRoomCtx={gameRoomCtx}
          coverArt={<CoverArt />}
          onUserVsComputer={() => $d(['InputMode', { mode: 'UserVsBot', userId: ctx.currentUserId }])}
          onUserVsUser={() => $d(['InputMode', { mode: 'UserVsUser', userId: ctx.currentUserId }])}
          title="Chess"
        />
      )
    }

    case "UserVsBot": {
      return (
        <UserVsBot.View
          ctx={ctx}
          $d={(msg) => $d(["UserVsBot", msg])}
          model={model.mode[1]}
          onClose={() =>
            $d(["InputMode", { mode: "None", userId: ctx.currentUserId }])
          }
        />
      )
    }

    case "UserVsUser": {
      return (
        <UserVsUser.View
          ctx={ctx}
          model={model.mode[1]}
          $d={(msg) => $d(["UserVsUser", msg])}
          onClose={() =>
            $d(["InputMode", { mode: "None", userId: ctx.currentUserId }])
          }
        />
      )
    }
  }
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
    <svg width="100%" viewBox={"0 0 2 2"}>
      <rect x={0} y={0} width={1} height={1} fill={theme.lightSquare} />

      <rect x={0} y={1} width={1} height={1} fill={theme.darkSquare} />

      <rect x={1} y={1} width={1} height={1} fill={theme.lightSquare} />

      <rect x={1} y={0} width={1} height={1} fill={theme.darkSquare} />

      <svg
        x={0} y={0}
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
  sendToBackend: (msg: ToBackend) => Cmd
  frontendModel: FrontendModel
  backendModel: BackendModel
}): [FrontendModel, Cmd<Msg>] => {
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
              UserVsUser.mergeWithBackend(
                frontendModel.mode[1],
                backendModel[1],
              ),
            ],
          },
          Cmd.None,
        ]
      }

      const [child, childCmd] = UserVsUser.init({
        userId: "None",
        sendToBackend: (msg) => sendToBackend(["UserVsUser", msg]),
      })

      return [
        {
          ...frontendModel,
          mode: [
            "UserVsUser",
            UserVsUser.mergeWithBackend(child, backendModel[1]),
          ],
        },
        Cmd.tag("UserVsUser", childCmd),
      ]
    }

    case "UserVsBot": {
      if (frontendModel.mode[0] === "UserVsBot") {
        return [
          {
            ...frontendModel,
            mode: [
              "UserVsBot",
              UserVsBot.mergeWithBackend(
                frontendModel.mode[1],
                backendModel[1],
              ),
            ],
          },
          Cmd.None,
        ]
      }

      const [child, childCmd] = UserVsBot.init({
        sendToBackend: (msg) => sendToBackend(["UserVsBot", msg]),
      })

      return [
        {
          ...frontendModel,
          mode: [
            "UserVsBot",
            UserVsBot.mergeWithBackend(child, backendModel[1]),
          ],
        },
        Cmd.tag("UserVsBot", childCmd),
      ]
    }
  }
}
