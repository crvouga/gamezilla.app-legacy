import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { SpaceBackendCtx } from '~/app/spaces/@/space-server/ctx'
import { SpaceBackendEvt } from '~/app/spaces/@/space-server/evt'
import { handleBotMove, initShared, type ModelBackend, type MsgBackend, type MsgToBackend } from './vs-bot.types'

//
//
//
// model
//
//
//

export type Model = ModelBackend

export const init = initShared

//
//
//
// update
//
//
//

export type Msg = MsgBackend

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
  switch (msg.t) {
    case 'none': {
      return {
        model,
      }
    }
  }
}

type UpdateFromClient = (input: { ctx: SpaceBackendCtx; msg: MsgToBackend; model: Model }) => {
  model: Model
  eff?: Eff<Msg>
}

export const updateFromClient: UpdateFromClient = (input) => {
  return updateBotMove(input)
}

const updateBotMove: UpdateFromClient = ({ model }) => {
  const handled = handleBotMove(model)

  if (handled.t === 'err') {
    return {
      model,
      eff: Eff.None,
    }
  }

  const modelNew = handled.value

  return {
    model: modelNew,
  }
}

export const updateFromEvent = ({
  msg,
  model,
}: {
  msg: SpaceBackendEvt
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'space-evt.user-joined-space') {
    return {
      model: init({
        userId: model.userId,
      }),
    }
  }

  return { model }
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
