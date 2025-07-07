import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { ViewportVisibility } from '~/@/viewport'
import { AppFrontendCtxBase } from '~/app/@/frontend/ctx'

export type Model = {
  visibility: ViewportVisibility
}

export const init = (input: { ctx: AppFrontendCtxBase }): { model: Model } => {
  return {
    model: {
      visibility: input.ctx.viewport.visibility.get(),
    },
  }
}

export type Msg = { t: 'viewport-became-hidden' } | { t: 'viewport-became-visible' }

export const update = ({
  msg,
  model,
}: {
  msg?: Msg | null
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  if (msg) return updateFromMsg({ msg, model })

  return { model }
}

const updateFromMsg: typeof update = ({ msg, model }) => {
  if (!msg) return { model }

  switch (msg.t) {
    case 'viewport-became-hidden': {
      return { model: { ...model, visibility: 'hidden' } }
    }

    case 'viewport-became-visible': {
      return { model: { ...model, visibility: 'visible' } }
    }
  }
}

const visibilityStateSubscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return input.ctx.viewport.visibility.sub((state) => {
    switch (state) {
      case 'hidden': {
        return {
          t: 'viewport-became-hidden',
        }
      }

      case 'visible': {
        return {
          t: 'viewport-became-visible',
        }
      }
    }
  })
}

export const subscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return visibilityStateSubscriptions(input)
}
