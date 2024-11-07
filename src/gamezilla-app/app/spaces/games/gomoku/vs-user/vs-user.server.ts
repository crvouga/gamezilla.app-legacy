import { Sub, type Eff } from '@/core'
import { SpaceServerCtx } from 'gamezilla-app/app/spaces/@/space-server-ctx'
import { SpaceServerEvt } from 'gamezilla-app/app/spaces/@/space-server-evt'
import { initShared, type ModelServer, type MsgServer, type MsgToServer } from './vs-user.types'

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
  model
}: {
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  return { model }
}

export const updateFromClient = ({
  model
}: {
  ctx: SpaceServerCtx
  msg: MsgToServer
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  return { model }
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
  if (msg.t === 'space/user-left-space') {
    return { model: init(model) }
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
