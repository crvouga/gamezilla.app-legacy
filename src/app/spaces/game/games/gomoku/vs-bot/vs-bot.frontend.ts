import { Eff } from '~/@/eff'
import { Box } from '~/@/vdom/primitives/box'
import { isErr } from '~/@/result'
import { Sub } from '~/@/sub'
import { h } from '~/@/vdom/h'
import { AppFrontendCtx } from '~/app/@/frontend/ctx'
import {
  type ModelBackend,
  type ModelFrontend,
  type MsgFrontend,
  type MsgToFrontend,
  handle,
  initShared,
} from './vs-bot.types'

//
//
//
// Model
//
//
//

export type Model = ModelFrontend

export const init = initShared

//
//
//
// Update
//
//
//

export type Msg = MsgFrontend

export const update = ({
  ctx,
  msg,
  model,
}: {
  ctx: AppFrontendCtx
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
        model,
      })

      if (isErr(result)) {
        return {
          model,
          eff: Eff.None,
        }
      }

      const merged = mergeWithBackend({
        ctx,
        backendModel: result.value,
        frontendModel: model,
      })

      return {
        model: merged,
        eff: Eff.None,
      }
    }
  }
}

export const updateFromBackend = ({
  msg,
  model,
  ctx,
}: {
  ctx: AppFrontendCtx
  msg: MsgToFrontend
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.result.t === 'err') {
    return { model }
  }

  const merged = mergeWithBackend({
    ctx,
    frontendModel: model,
    backendModel: msg.result.value,
  })

  return { model: merged }
}

export const mergeWithBackend = ({
  backendModel,
  frontendModel,
}: {
  ctx: AppFrontendCtx
  frontendModel: ModelFrontend
  backendModel: ModelBackend
}): ModelFrontend => {
  return { ...frontendModel, ...backendModel }
}

//
//
//
// subscriptions
//
//
//

export const subscriptions = (_ctx: AppFrontendCtx, model: Model): Sub<Msg> => {
  switch (model.type) {
    case 'game': {
      return Sub.none()
    }

    case 'setup': {
      return Sub.none()
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

export const View = (_input: { model: Model; ctx: AppFrontendCtx; dispatch: (m: Msg) => void; onBack: () => void }) => {
  return h(Box, {}, ['View'])
}
