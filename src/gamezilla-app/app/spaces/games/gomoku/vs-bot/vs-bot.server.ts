import { Eff, Sub, andThen, pipe } from 'gamezilla-app/@/core'
import { handleBotMove, initShared, type ModelServer, type MsgServer, type MsgToServer } from './vs-bot.types'
import { SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space-server-evt'
import { SpaceServerCtx } from 'gamezilla-app/app/spaces/@/space-server-ctx'

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

type updateFromClient = (input: { ctx: SpaceServerCtx; msg: MsgToServer; model: Model }) => {
  model: Model
  eff?: Eff<Msg>
}

export const updateFromClient: updateFromClient = (input) => {
  return pipe(
    input,
    andThen((model) =>
      updateFromClient_({
        ...input,
        model
      })
    ),
    andThen((model) =>
      updateBotMove({
        ...input,
        model
      })
    )
  )
}

const updateBotMove: updateFromClient = ({ model }) => {
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

const updateFromClient_: updateFromClient = ({ msg, model }) => {
  switch (msg.t) {
    default: {
      return {
        model
      }
    }
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
