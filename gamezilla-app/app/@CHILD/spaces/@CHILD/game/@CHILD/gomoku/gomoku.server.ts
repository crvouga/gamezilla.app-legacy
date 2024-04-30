import {
  SpaceReqCtx,
  SpaceServerEvent,
} from "gamezilla-app/app/@CHILD/spaces/@SHARED/space"
import { UserId } from "gamezilla-app/app/@SHARED/data"
import { Eff, Sub } from "gamezilla-app/@SHARED/core"
import * as VsBot from "./@CHILD/vs-bot/vs-bot.server"
import * as VsUser from "./@CHILD/vs-user/vs-user.server"
import { Mode, ModelServer, MsgServer, MsgToServer } from "./gomoku.core"

//
//
//
// Model
//
//
//

export type Model = ModelServer

export const init: Model = {
  t: "none",
}

const initMode = ({ mode, userId }: { mode: Mode; userId: UserId }): Model => {
  switch (mode) {
    case "none": {
      return { t: "none" }
    }

    case "vs-bot": {
      return {
        t: "vs-bot",
        c: VsBot.init({ userId }),
      }
    }

    case "vs-user": {
      return {
        t: "vs-user",
        c: VsUser.init({ white: userId, black: null }),
      }
    }
  }
}

//
//
//
// update
//
//
//

export type Msg = MsgServer

export const update = ({
  msg,
  model,
}: {
  msg: Msg
  model: Model
}): { model: Model; eff?: Eff<Msg> } => {
  if (msg.t === "vs-bot" && model.t === "vs-bot") {
    const updated = VsBot.update({ msg: msg.c, model: model.c })
    return {
      model: { t: "vs-bot", c: updated.model },
      eff: Eff.tag("vs-bot", updated.eff),
    }
  }

  if (msg.t === "vs-user" && model.t === "vs-user") {
    const updated = VsUser.update({ msg: msg.c, model: model.c })
    return {
      model: { t: "vs-user", c: updated.model },
      eff: Eff.tag("vs-user", updated.eff),
    }
  }

  return { model }
}

export const updateFromClient = ({
  ctx,
  msg,
  model,
}: {
  ctx: SpaceReqCtx
  msg: MsgToServer
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === "input-mode") {
    const modelNew = initMode(msg)
    return {
      model: modelNew,
      eff: Eff.None,
    }
  }

  if (model.t === "vs-bot" && msg.t === "vs-bot") {
    const updated = VsBot.updateFromClient({
      ctx,
      msg: msg.c,
      model: model.c,
    })
    return {
      model: { t: "vs-bot", c: updated.model },
      eff: Eff.tag("vs-bot", updated.eff),
    }
  }

  if (model.t === "vs-user" && msg.t === "vs-user") {
    const updated = VsUser.updateFromClient({
      msg: msg.c,
      model: model.c,
      ctx,
    })

    return {
      model: { t: "vs-user", c: updated.model },
      eff: Eff.tag("vs-user", updated.eff),
    }
  }

  return { model }
}

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceServerEvent
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (model.t === "vs-bot") {
    const updated = VsBot.updateFromEvent({ msg, model: model.c })
    return {
      model: { t: "vs-bot", c: updated.model },
      eff: Eff.tag("vs-bot", updated.eff),
    }
  }

  if (model.t === "vs-user") {
    const updated = VsUser.updateFromEvent({ msg, model: model.c })
    return {
      model: { t: "vs-user", c: updated.model },
      eff: Eff.tag("vs-user", updated.eff),
    }
  }

  return {
    model,
  }
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.None
}
