import { SpaceServerEvent } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space"
import { SpaceServerCmd } from "gamezilla-app/@CHILD/app/@CHILD/spaces/@SHARED/space-server-cmd"
import { Eff, Sub, Time } from "gamezilla-app/@SHARED/core"
import { TimeSpan } from "gamezilla-app/@SHARED/core/time-span"
import * as Board from "../../@SHARED/chess/chess"
import {
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
  initCore,
} from "./vs-user.core"

//
//
//
// Model
//
//
//

export const init = initCore

//
//
//
// Update
//
//
//

export const update = (
  _msg: MsgServer,
  model: ModelServer,
): { model: ModelServer } => {
  return { model }
}

export const updateFromClient = (
  _msg: MsgToServer,
  model: ModelServer,
): {
  model: ModelServer
  eff?: Eff<MsgServer>
  msgCmd?: SpaceServerCmd<MsgToClient>[]
} => {
  return { model }
}

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceServerEvent
  model: ModelServer
}): {
  model: ModelServer
  eff?: Eff<MsgServer>
  msgCmd?: SpaceServerCmd<MsgToClient>[]
} => {
  if (msg.t === "user-left") {
    switch (model.type) {
      case "setup": {
        const { userId } = msg
        const color: Board.Color | "none" =
          model.b === userId ? "b" : model.w === userId ? "w" : "none"

        if (color === "none") {
          return { model }
        }

        const modelNew: ModelServer = { ...model, [color]: "none" }

        return {
          model: modelNew,
          msgCmd: [{ t: "send-to-space", msg: ["player-left", modelNew] }],
        }
      }

      case "game":
      case "game-over": {
        const { userId } = msg

        const color: Board.Color | "none" =
          model.b === userId ? "b" : model.w === userId ? "w" : "none"

        if (color === "none") {
          return { model }
        }

        const otherColor = Board.toOppositeColor(color)

        const modelNew: ModelServer = {
          ...model,
          type: "setup",
          clockPreset: model.clock.preset,
          [otherColor]: model[otherColor],
          [color]: "none",
        }

        return {
          model: modelNew,
          msgCmd: [{ t: "send-to-space", msg: ["player-left", modelNew] }],
        }
      }
    }
  }
  return { model }
}

//
//
//
// Subscriptions
//
//
//

export const subscriptions = (
  intervalId: string,
  model: ModelServer,
): Sub<MsgServer> => {
  switch (model.type) {
    case "setup": {
      return Sub.None
    }

    case "game-over": {
      return Sub.None
    }

    case "game": {
      const turn = Board.toTurn(model.board)

      switch (turn) {
        case "b": {
          return Time.interval(
            `${intervalId}-b`,
            TimeSpan.fromMilliseconds(1000),
            () => ["ClockTicked"],
          )
        }
        case "w": {
          return Time.interval(
            `${intervalId}-w`,
            TimeSpan.fromMilliseconds(1000),
            () => ["ClockTicked"],
          )
        }
      }
    }
  }
}
