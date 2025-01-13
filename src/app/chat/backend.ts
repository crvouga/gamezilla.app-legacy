import { Eff } from '~/@/eff'
import type { ModelBackend, MsgBackend, MsgToBackend } from './types'

export const init: { model: ModelBackend } = { model: null }

export const updateFromFrontend = ({
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
