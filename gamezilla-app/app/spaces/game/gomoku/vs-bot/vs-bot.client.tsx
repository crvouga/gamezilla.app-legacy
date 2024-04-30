import { ClientCtx } from "gamezilla-app/app/@shared/client"
import { Eff, Sub, isErr } from "gamezilla-app/@shared/core"
import {
  ModelClient,
  MsgClient,
  ModelServer,
  MsgToClient,
  handle,
  initShared,
} from "./vs-bot.core"

//
//
//
// Model
//
//
//

export type Model = ModelClient

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = MsgClient

export const update = ({
  ctx,
  msg,
  model,
}: {
  ctx: ClientCtx
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  switch (msg.t) {
    default: {
      const result = handle({ ctx, msg, model })

      if (isErr(result)) {
        return {
          model,
          eff: Eff.None,
        }
      }

      const merged = mergeWithServer({
        ctx,
        serverModel: result.value,
        clientModel: model,
      })

      return {
        model: merged,
        eff: Eff.None,
      }
    }
  }
}

export const updateFromServer = ({
  msg,
  model,
  ctx,
}: {
  ctx: ClientCtx
  msg: MsgToClient
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.result.t === "err") {
    return { model }
  }

  const merged = mergeWithServer({
    ctx,
    clientModel: model,
    serverModel: msg.result.value,
  })

  return { model: merged }
}

export const mergeWithServer = ({
  serverModel,
  clientModel,
}: {
  ctx: ClientCtx
  clientModel: ModelClient
  serverModel: ModelServer
}): ModelClient => {
  return { ...clientModel, ...serverModel }
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_ctx: ClientCtx, model: Model): Sub<Msg> => {
  switch (model.type) {
    case "game": {
      return Sub.None
    }

    case "setup": {
      return Sub.None
    }
  }
}

//
//
//
// view
//
//
//

export const View = (_props: {
  model: Model
  ctx: ClientCtx
  dispatch: (m: Msg) => void
  onBack: () => void
}) => {
  return <div></div>
}
