import type { Eff } from '@/core'
import type { ModelServer, MsgServer, MsgToServer } from './search.types'

type Model = ModelServer

export const init: { model: Model } = {
  model: null
}

type Msg = MsgServer

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
  model,
  msg
}: {
  msg: MsgToServer
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg.t === 'search') {
    return { model }
  }
  return { model }
}
