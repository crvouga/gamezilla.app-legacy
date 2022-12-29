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
import * as VsUser from "./VsUser/VsUser.Frontend"

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

    case "VsUser": {
      if (model.mode[0] === "VsUser") {
        const [child, cmd] = VsUser.update(
          { sendToBackend: (msg) => sendToBackend(["VsUser", msg]) },
          msg[1],
          model.mode[1],
        )

        return [
          { ...model, mode: ["VsUser", child] },
          Cmd.tag("VsUser", cmd),
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

    case "VsUser": {
      if (model.mode[0] === "VsUser") {
        const [child, cmd, actions] = VsUser.updateFromBackend(
          { ctx },
          msg[1],
          model.mode[1],
        )

        return [
          { ...model, mode: ["VsUser", child] },
          Cmd.tag("VsUser", cmd),
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
          onVsUser: () => $d(['InputMode', { mode: 'VsUser', userId: ctx.currentUserId }]),
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

    case "VsUser": {
      return (
        <VsUser.View
          ctx={ctx}
          model={model.mode[1]}
          $d={(msg) => $d(["VsUser", msg])}
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

    case "VsUser": {
      if (frontendModel.mode[0] === "VsUser") {
        return [
          {
            ...frontendModel,
            mode: [
              "VsUser",
              VsUser.mergeWithBackend(
                frontendModel.mode[1],
                backendModel[1],
              ),
            ],
          },
          Cmd.None,
        ]
      }

      const [child, childCmd] = VsUser.init({
        userId: "None",
        sendToBackend: (msg) => sendToBackend(["VsUser", msg]),
      })

      return [
        {
          ...frontendModel,
          mode: [
            "VsUser",
            VsUser.mergeWithBackend(child, backendModel[1]),
          ],
        },
        Cmd.tag("VsUser", childCmd),
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


