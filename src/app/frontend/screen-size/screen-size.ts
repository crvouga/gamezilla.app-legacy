import { Browser } from '~/@/browser'
import { pipe } from '~/@/function/pipe'
import { Sub } from '~/@/sub'
import { ScreenSize } from '~/app/@/ui/screen/screen-size'

export type Model = { screenSize: ScreenSize }

export const init = (): { model: Model } => {
  return { model: { screenSize: ScreenSize.get() } }
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

export const subscriptions: Sub<Msg> = pipe(
  Browser.onWindowResize<Msg>(({ width }) => ({ t: 'screen-size-changed', screenSize: ScreenSize.to(width) })),
  (sub) => Sub.deduplicate('screen-size', (msg) => (msg.t === 'screen-size-changed' ? msg.screenSize : 'mobile'), sub),
)
