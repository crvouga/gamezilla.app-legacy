import { Eff } from '~/@/eff'
import { isAnyMsg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { ViewportVisibility } from '~/@/viewport'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { ViewportVisibilityChangedEvt } from '~/app/@/frontend/viewport-visibility-changed-evt.$msg'

export type Model = {
  viewport_visibility: ViewportVisibility
}

export const init = (input: { ctx: AppFrontendCtxBase }): { model: Model } => {
  return {
    model: {
      viewport_visibility: input.ctx.viewport.visibility.get(),
    },
  }
}

export type Msg = { n: 'viewport'; t: 'viewport_becameHidden' } | { n: 'viewport'; t: 'viewport_becameVisible' }

const isMsg = (msg: unknown): msg is Msg => {
  return isAnyMsg(msg) && msg.t.startsWith('viewport_')
}

export const update = <T extends Model>(input: {
  ctx: AppFrontendCtxBase
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<Msg>
  msgOut?: unknown[]
} => {
  if (!isMsg(input.msg)) return input

  switch (input.msg.t) {
    case 'viewport_becameHidden': {
      return {
        model: { ...input.model, viewport_visibility: 'hidden' },
        msgOut: [ViewportVisibilityChangedEvt.init('hidden')],
      }
    }

    case 'viewport_becameVisible': {
      return {
        model: { ...input.model, viewport_visibility: 'visible' },
        msgOut: [ViewportVisibilityChangedEvt.init('visible')],
      }
    }

    default: {
      return input
    }
  }
}

const visibilityStateSubscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return input.ctx.viewport.visibility.sub((state) => {
    switch (state) {
      case 'hidden': {
        return {
          n: 'viewport',
          t: 'viewport_becameHidden',
        }
      }

      case 'visible': {
        return {
          n: 'viewport',
          t: 'viewport_becameVisible',
        }
      }
    }
  })
}

export const subscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return visibilityStateSubscriptions(input)
}
