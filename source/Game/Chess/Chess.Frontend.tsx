import * as Alerts from "../../Alerts"
import { Audio, Cmd, p, RemoteData, Sub, Unit } from "../../Core"
import { Ctx, viewSelectModeScreen, GameRoomCtx } from "../Game"
import { viewCoverArt } from "./Chess"
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
        viewSelectModeScreen({
          ctx: ctx,
          gameRoomCtx: gameRoomCtx,
          coverArt: viewCoverArt(),
          onUserVsComputer: () => $d(['InputMode', { mode: 'UserVsBot', userId: ctx.currentUserId }]),
          onUserVsUser: () => $d(['InputMode', { mode: 'UserVsUser', userId: ctx.currentUserId }]),
          title: "Chess"
        })

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


