import { Eff, Sub, Time } from "gamezilla-app/@shared/core"
import { TimeSpan } from "gamezilla-app/@shared/core/time-span"
import {
  ModelServer,
  MsgServer,
  MsgToServer,
  Res,
  handle,
  initShared,
  tick,
} from "./maze.core"

//
//
//
// Model
//
//
//

export type Model = ModelServer

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = MsgServer

export const update = (msg: Msg, model: Model): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "tick": {
      const modelNew = tick(model)
      return [modelNew, Eff.None]
    }
  }
}

export const updateFromClient = (
  msg: MsgToServer,
  model: Model,
): [Model, Eff<Msg>] => {
  switch (msg[0]) {
    case "stop-game":
    case "input-direction":
    case "input-seed":
    case "start-game":
    case "stop-playing":
    case "start-playing": {
      const res: Res = [...msg, handle(msg, model)]
      const modelNew = res[2].t === "ok" ? res[2].value : model
      return [modelNew, Eff.None]
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

export const subscriptions = (
  intervalId: string,
  model: ModelServer,
): Sub<Msg> => {
  if (model.type === "game") {
    return Time.interval(intervalId, TimeSpan.fromSeconds(1 / 2), () => [
      "tick",
    ])
    // return Sub.None
  }
  return Sub.None
}
