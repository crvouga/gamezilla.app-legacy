import { Sub } from '~/@/sub'
import { FrontendCtxModule } from '../types'
import type { FrontendModule, ModelFrontend, MsgFrontend } from './types'
import { Eff } from '~/@/eff'

const update = <T extends ModelFrontend>(input: {
  ctx: FrontendCtxModule
  model: T
  msg?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  return { model: input.model }
}

const subscriptions: FrontendModule['subscriptions'] = () => {
  return Sub.none()
}

const View: FrontendModule['View'] = (_input) => {
  return null
}

export const BackendInstanceFrontend = {
  update,
  subscriptions,
  View,
}
