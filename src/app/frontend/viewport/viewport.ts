import { Eff } from '~/@/eff'
import { AnyMsg, isAnyMsg } from '~/@/msg/msg'
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

export type Msg = { t: 'viewport_becameHidden' } | { t: 'viewport_becameVisible' }

const isMsg = (msg: unknown): msg is Msg => {
  return isAnyMsg(msg) && msg.t.startsWith('viewport_')
}

export const update = <TModel extends Model>(input: {
  msg?: AnyMsg | null
  msgIn?: unknown
  model: TModel
}): {
  model: TModel
  eff?: Eff<Msg>
  msgOut?: unknown[]
} => {
  if (input.msg) return updateFromMsg(input)

  return { model: input.model }
}

const updateFromMsg: typeof update = (input) => {
  if (!isMsg(input.msg)) return { model: input.model }

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
      return { model: input.model }
    }
  }
}

const visibilityStateSubscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return input.ctx.viewport.visibility.sub((state) => {
    switch (state) {
      case 'hidden': {
        return {
          t: 'viewport_becameHidden',
        }
      }

      case 'visible': {
        return {
          t: 'viewport_becameVisible',
        }
      }
    }
  })
}

export const subscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return visibilityStateSubscriptions(input)
}
