import { Eff, Sub, pipe } from "gamezilla-app/@shared/core"
import {
  SpaceReqCtx,
  SpaceServerEvent,
} from "gamezilla-app/app/spaces/@shared/space"
import { SpaceServerCmd } from "gamezilla-app/app/spaces/@shared/space-server-cmd"
import { Chess } from "../@shared/chess"
import {
  ModelServer,
  MsgServer,
  MsgToClient,
  MsgToServer,
  botMoved,
  initServer,
  isBotTurn,
} from "./vs-bot.core"

//
//
//
// Model
//
//
//

export type Model = ModelServer

export const init = initServer

//
//
//
// Update
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
}): {
  model: Model
  eff?: Eff<Msg>
  msgCmd?: SpaceServerCmd<MsgToClient>[]
} => {
  if (msg.t === "bot-moved") {
    const result = botMoved(msg.moved, model)

    const modelNew = result.t === "err" ? model : result.value

    return {
      model: modelNew,
      msgCmd: [{ t: "send-to-space", msg: { t: "bot-moved", result } }],
    }
  }

  return { model }
}

export const updateFromClient = (input: {
  msg: MsgToServer
  model: Model
  ctx: SpaceReqCtx
}): {
  model: Model
  eff?: Eff<Msg>
  msgCmd?: SpaceServerCmd<MsgToClient>[]
} => {
  const updated = updateFromClientMain(input)

  return {
    ...updated,
    eff: Eff.batch([updated.eff, toBotMoveEff(input.model, updated.model)]),
  }
}

const toBotMoveEff = (modelPrev: Model, modelNext: Model): Eff<Msg> => {
  const didChangeToBotTurn = !isBotTurn(modelPrev) && isBotTurn(modelNext)

  if (!didChangeToBotTurn) {
    return Eff.None
  }
  if (modelNext.type !== "game") {
    return Eff.None
  }

  const eff = pipe(
    Chess.getBestMove(modelNext.botLevel, modelNext.board),
    Eff.perform((moved): Msg => ({ t: "bot-moved", moved })),
  )

  return eff
}

const updateFromClientMain: typeof updateFromClient = ({ model }) => {
  // const handled = updateCore({ msg, model });

  // const modelNew: Model = handled.t === "err" ? model : handled.value;

  // return {
  //   model: modelNew,
  //   msgCmd: [{ t: "send-to-space", msg: { ...msg, result: handled } }],
  // };
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
  msgCmd?: SpaceServerCmd<MsgToClient>[]
  eff?: Eff
} => {
  if (msg.t === "user-left") {
    if (model.userId === msg.userId) {
      const modelNew: Model = {
        type: "setup",
        botLevel: model.botLevel,
        userColor: model.userColor,
        userId: null,
      }
      return {
        model: modelNew,
        msgCmd: [
          {
            t: "send-to-space",
            msg: { t: "player-left", model: modelNew },
          },
        ],
      }
    }
    return { model }
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

export const subscriptions = (_intervalId: string, _model: Model): Sub<Msg> => {
  return Sub.None
}
