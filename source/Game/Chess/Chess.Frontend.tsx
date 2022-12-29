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

    case "VsBot": {
      if (model.mode[0] === "VsBot") {
        const [child, cmd] = VsBot.update(
          { sendToBackend: (msg) => sendToBackend(["VsBot", msg]) },
          msg[1],
          model.mode[1],
        )

        return [
          { ...model, mode: ["VsBot", child] },
          Cmd.tag("VsBot", cmd),
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

    case "VsBot": {
      if (model.mode[0] === "VsBot") {
        const [child, cmd, actions] = VsBot.updateFromBackend(
          msg[1],
          model.mode[1],
        )

        return [
          { ...model, mode: ["VsBot", child] },
          Cmd.tag("VsBot", cmd),
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
  $send,
  gameRoomCtx
}: {
  ctx: Ctx
  model: Model
  $send: (msg: Msg) => void
  gameRoomCtx: GameRoomCtx
}) => {
  switch (model.mode[0]) {
    case "None": {
      return (
        viewSelectModeScreen({
          ctx: ctx,
          gameRoomCtx: gameRoomCtx,
          coverArt: viewCoverArt(),
          onUserVsComputer: () => $send(['InputMode', { mode: 'VsBot', userId: ctx.currentUserId }]),
          onVsUser: () => $send(['InputMode', { mode: 'VsUser', userId: ctx.currentUserId }]),
          title: "Chess"
        })

      )
    }

    case "VsBot": {
      return (
        <VsBot.View
          ctx={ctx}
          $send={(msg) => $send(["VsBot", msg])}
          model={model.mode[1]}
          onClose={() =>
            $send(["InputMode", { mode: "None", userId: ctx.currentUserId }])
          }
        />
      )
    }

    case "VsUser": {
      return (
        <VsUser.View
          ctx={ctx}
          model={model.mode[1]}
          $send={(msg) => $send(["VsUser", msg])}
          onClose={() =>
            $send(["InputMode", { mode: "None", userId: ctx.currentUserId }])
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

    case "VsBot": {
      if (frontendModel.mode[0] === "VsBot") {
        return [
          {
            ...frontendModel,
            mode: [
              "VsBot",
              VsBot.mergeWithBackend(
                frontendModel.mode[1],
                backendModel[1],
              ),
            ],
          },
          Cmd.None,
        ]
      }

      const [child, childCmd] = VsBot.init({
        sendToBackend: (msg) => sendToBackend(["VsBot", msg]),
      })

      return [
        {
          ...frontendModel,
          mode: [
            "VsBot",
            VsBot.mergeWithBackend(child, backendModel[1]),
          ],
        },
        Cmd.tag("VsBot", childCmd),
      ]
    }
  }
}


