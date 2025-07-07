import { pipe } from '~/@/function/pipe'
import { Sub } from '~/@/sub'
import type { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'

export type Model = { screenSize: ScreenSize }

export const init = (input: { ctx: AppFrontendCtxBase }): { model: Model } => {
  return { model: { screenSize: ScreenSize.get(input.ctx.viewport) } }
}

export type Msg = { t: 'screen-size-changed'; screenSize: ScreenSize }

export const update = (input: { msg?: Msg | null; model: Model; msgIn?: unknown }): { model: Model } => {
  if (!input.msg) return { model: input.model }

  switch (input.msg.t) {
    case 'screen-size-changed': {
      return { model: { ...input.model, screenSize: input.msg.screenSize } }
    }
  }
}

export const subscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return pipe(
    input.ctx.viewport.size.sub(({ width }): Msg => ({ t: 'screen-size-changed', screenSize: ScreenSize.to(width) })),
    (sub): Sub<Msg> =>
      Sub.deduplicate('screen-size', (msg) => (msg.t === 'screen-size-changed' ? msg.screenSize : 'mobile'), sub),
  )
}
