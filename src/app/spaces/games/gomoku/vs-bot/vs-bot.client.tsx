import { Eff } from '~/@/eff'
import { isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { AppClientCtx } from '~/app/@/client/client-ctx'
import {
  type ModelClient,
  type ModelServer,
  type MsgClient,
  type MsgToClient,
  handle,
  initShared
} from './vs-bot.types'

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
  model
}: {
  ctx: AppClientCtx
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  switch (msg.t) {
    default: {
      const result = handle({
        ctx,
        msg,
        model
      })

      if (isErr(result)) {
        return {
          model,
          eff: Eff.None
        }
      }

      const merged = mergeWithServer({
        ctx,
        serverModel: result.value,
        clientModel: model
      })

      return {
        model: merged,
        eff: Eff.None
      }
    }
  }
}

export const updateFromServer = ({
  msg,
  model,
  ctx
}: {
  ctx: AppClientCtx
  msg: MsgToClient
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.result.t === 'err') {
    return { model }
  }

  const merged = mergeWithServer({
    ctx,
    clientModel: model,
    serverModel: msg.result.value
  })

  return { model: merged }
}

export const mergeWithServer = ({
  serverModel,
  clientModel
}: {
  ctx: AppClientCtx
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

export const subscriptions = (_ctx: AppClientCtx, model: Model): Sub<Msg> => {
  switch (model.type) {
    case 'game': {
      return Sub.None
    }

    case 'setup': {
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

export const View = (_input: { model: Model; ctx: AppClientCtx; dispatch: (m: Msg) => void; onBack: () => void }) => {
  return <div />
}
