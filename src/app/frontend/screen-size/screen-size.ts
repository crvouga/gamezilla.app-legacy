import { pipe } from '~/@/function/pipe'
import { isAnyMsg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import type { AppFrontendCtxBase } from '~/app/@/frontend/ctx'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'

export type Model = { screenSize_screenSize: ScreenSize }

export const init = (input: { ctx: AppFrontendCtxBase }): { model: Model } => {
  return { model: { screenSize_screenSize: ScreenSize.get(input.ctx.viewport) } }
}

export type Msg = { t: 'screenSize_screenSizeChanged'; screenSize: ScreenSize }

const isMsg = (msg: unknown): msg is Msg => isAnyMsg(msg) && msg.t.startsWith('screenSize_')

export const update = <TModel extends Model>(input: {
  msg?: unknown
  model: TModel
  msgIn?: unknown
}): {
  model: TModel
  msgOut?: unknown[]
} => {
  if (!isMsg(input.msg)) return { model: input.model }

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
