import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { SpaceServerCtx } from '~/app/spaces/@/space-server-ctx'
import { SpaceServerEvt } from '~/app/spaces/@/space-server-evt'
import { handleBotMove, initShared, type ModelServer, type MsgServer, type MsgToServer } from './vs-bot.types'

//
//
//
// model
//
//
//

export type Model = ModelServer

export const init = initShared

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
  model
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
        model
      }
    }
  }
}

type UpdateFromClient = (input: { ctx: SpaceServerCtx; msg: MsgToServer; model: Model }) => {
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
      eff: Eff.None
    }
  }

  const modelNew = handled.value

  return {
    model: modelNew
  }
}

export const updateFromEvent = ({
  msg,
  model
}: {
  msg: SpaceServerEvt
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'space/user-joined-space') {
    return {
      model: init({
        userId: model.userId
      })
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
