import { Eff } from '~/@/eff'
import type { ModelBackend, MsgBackend, MsgToBackend } from './chat.core'

export const init: { model: ModelBackend } = { model: null }

export const updateFromClient = ({
  model,
}: {
  msg: MsgToBackend
  model: ModelBackend
}): {
  model: ModelBackend
  eff?: Eff<MsgBackend>
} => {
  return { model }
}

export const update = ({
  model,
}: {
  msg: MsgBackend
  model: ModelBackend
}): {
  model: ModelBackend
  eff?: Eff<MsgBackend>
} => {
  return { model }
}
