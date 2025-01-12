import type { Eff } from '~/@/eff'
import type { ModelBackend, MsgBackend, MsgToBackend } from './search.types'

type Model = ModelBackend

export const init: { model: Model } = {
  model: null,
}

type Msg = MsgBackend

export const update = ({
  model,
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
  msg,
}: {
  msg: MsgToBackend
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
