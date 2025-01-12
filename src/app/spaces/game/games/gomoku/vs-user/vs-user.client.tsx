import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { AppClientCtx } from '~/app/@/client/ctx'
import { type ModelClient, type ModelBackend, type MsgClient, type MsgToClient, initShared } from './vs-user.types'

//
//
//
// model
//
//
//

export type Model = ModelClient

export const init = initShared

//
//
//
// update
//
//
//

export type Msg = MsgClient

export const update = ({
  msg,
  model,
}: {
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'clicked-cancel') {
    return {
      model: {
        ...model,
        confirming: undefined,
      },
    }
  }

  if (msg.t === 'resign') {
    if (model.confirming === 'resign') {
      return {
        model,
        eff: Eff.None,
      }
    }

    return {
      model: {
        ...model,
        confirming: 'resign',
      },
    }
  }

  return { model, eff: Eff.None }
}

export const updateFromBackend = ({
  msg,
  model,
}: {
  msg: MsgToClient
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'input-move') {
    if (msg.result.t === 'err') {
      return {
        model,
      }
    }
    const merged = mergeWithBackend({
      serverModel: msg.result.value,
      clientModel: model,
    })

    return { model: merged }
  }

  if (msg.result.t === 'err') {
    return { model }
  }

  const merged = mergeWithBackend({
    serverModel: msg.result.value,
    clientModel: model,
  })

  return { model: merged }
}

export const mergeWithBackend = ({
  serverModel,
}: {
  clientModel: ModelClient
  serverModel: ModelBackend
}): ModelClient => {
  return serverModel
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

//
//
//
// view
//
//
//

export const View = (_input: { dispatch: (m: Msg) => void; ctx: AppClientCtx; model: Model; onCancel: () => void }) => {
  return <div />
}
