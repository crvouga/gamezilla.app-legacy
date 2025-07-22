import { Eff } from '~/@/eff'
import { Box } from '~/@/vdom/primitives/box'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import {
  type ModelBackend,
  type ModelFrontend,
  type MsgFrontend,
  type MsgToFrontend,
  initShared,
} from './vs-user.types'
import { Text } from '~/@/vdom/primitives/text'

//
//
//
// model
//
//
//

export type Model = ModelFrontend

export const init = initShared

//
//
//
// update
//
//
//

export type Msg = MsgFrontend

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
  msg: MsgToFrontend
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
      backendModel: msg.result.value,
      frontendModel: model,
    })

    return { model: merged }
  }

  if (msg.result.t === 'err') {
    return { model }
  }

  const merged = mergeWithBackend({
    backendModel: msg.result.value,
    frontendModel: model,
  })

  return { model: merged }
}

export const mergeWithBackend = ({
  backendModel,
}: {
  frontendModel: ModelFrontend
  backendModel: ModelBackend
}): ModelFrontend => {
  return backendModel
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_model: Model): Sub<Msg> => {
  return Sub.none()
}

//
//
//
// view
//
//
//

export const View = (_input: {
  dispatch: (m: Msg) => void
  ctx: AppFrontendCtx
  model: Model
  onCancel: () => void
}) => {
  return h(Box, {}, [Text({ text: 'View' })])
}
