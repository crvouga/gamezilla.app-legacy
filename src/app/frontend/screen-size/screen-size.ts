import { Eff } from '~/@/eff'
import { pipe } from '~/@/function/pipe'
import { Sub } from '~/@/sub'
import type { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'

export type Model = { screenSize_screenSize: ScreenSize }

export const init = (input: { ctx: AppFrontendCtxBase }): { model: Model } => {
  return { model: { screenSize_screenSize: ScreenSize.get(input.ctx.viewport) } }
}

export type Msg = { n: 'screenSize'; t: 'screenSize_screenSizeChanged'; screenSize: ScreenSize }

export const update = (input: {
  ctx: unknown
  msg: Msg
  model: Model
}): {
  model: Model
  eff?: Eff<Msg>
} => {
  switch (input.msg.t) {
    case 'screenSize_screenSizeChanged': {
      return { model: { ...input.model, screenSize_screenSize: input.msg.screenSize } }
    }
  }
}

export const subscriptions = (input: { ctx: AppFrontendCtxBase }): Sub<Msg> => {
  return pipe(
    input.ctx.viewport.size.sub(
      ({ width }): Msg => ({
        n: 'screenSize',
        t: 'screenSize_screenSizeChanged',
        screenSize: ScreenSize.to(width),
      }),
    ),
    (sub): Sub<Msg> =>
      Sub.deduplicate(
        'screen-size',
        (msg) => (msg.t === 'screenSize_screenSizeChanged' ? msg.screenSize : 'mobile'),
        sub,
      ),
  )
}
