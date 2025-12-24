import { Eff } from '~/@/eff'
import type { FrontendCtxModule } from '../types'
import type { ModelFrontend, MsgFrontend } from './types'
import { Sub } from '~/@/sub'

export const init = (_input: {}): { model: ModelFrontend; eff?: Eff<MsgFrontend> } => {
  return {
    model: {
      backendInstance: {},
    },
  }
}

export const update = (input: {
  ctx: FrontendCtxModule
  model: ModelFrontend
  msg: MsgFrontend
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
} => {
  switch (input.msg.t) {
    case 'backendInstance_noop': {
      return { model: input.model }
    }
  }
}

export const subscriptions = (_input: { ctx: FrontendCtxModule; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.none()
}
