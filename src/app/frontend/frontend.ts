import { Eff } from '~/@/eff'
import { Sub } from '~/@/sub'
import { andThen } from '../@/frontend/and-then'
import { APP_SOUND } from '../@/frontend/app-sound'
import { AppFrontendCtxBase } from '../@/frontend/ctx'
import { PreloadSoundsCmd } from '../@/frontend/preload-sounds-cmd.$msg'
import { CopyToClipboardFrontend } from './copy-to-clipboard'
import { CurrentScreenFrontend } from './current-screen'
import { FocusFrontend } from './focus'
import { QueryCache } from './query-cache/query-cache'
import { ScreenSizeFrontend } from './screen-size'
import { ToasterFrontend } from './toaster'
import { type ModelFrontend, type MsgFrontend } from './types'
import { ViewportFrontend } from './viewport'

const init = (input: {
  ctx: AppFrontendCtxBase
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  const screen = CurrentScreenFrontend.init(input)
  const visibility = ViewportFrontend.init(input)
  const screenSize = ScreenSizeFrontend.init(input)
  const toast = ToasterFrontend.init(input)
  const focus = FocusFrontend.init(input)
  const copyToClipboard = CopyToClipboardFrontend.init(input)
  const queryCache = QueryCache.init(input)

  const initialModel: ModelFrontend = {
    ...focus.model,
    ...screen.model,
    ...toast.model,
    ...visibility.model,
    ...screenSize.model,
    ...copyToClipboard.model,
    ...queryCache.model,
  }

  const initialEff = Eff.batch<MsgFrontend>([screen.eff])

  return {
    model: initialModel,
    eff: initialEff,
    msgOut: [PreloadSoundsCmd.init(Object.values(APP_SOUND))],
  }
}

const update = <T extends ModelFrontend>(input: {
  ctx: AppFrontendCtxBase
  model: T
  msg?: unknown
  msgIn?: unknown
}): {
  model: T
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  return andThen<T, MsgFrontend>(
    input,
    (model) => CurrentScreenFrontend.update({ ...input, model }),
    (model) => ViewportFrontend.update({ ...input, model }),
    (model) => ToasterFrontend.update({ ...input, model }),
    (model) => ScreenSizeFrontend.update({ ...input, model }),
    (model) => CopyToClipboardFrontend.update({ ...input, model }),
    (model) => FocusFrontend.update({ ...input, model }),
    (model) => QueryCache.update({ ...input, model }),
  )
}

const subscriptions = (input: { ctx: AppFrontendCtxBase; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.batch<MsgFrontend>([
    ViewportFrontend.subscriptions(input),
    FocusFrontend.subscriptions,
    CopyToClipboardFrontend.subscriptions,
    ScreenSizeFrontend.subscriptions(input),
    CurrentScreenFrontend.subscriptions(input),
    ToasterFrontend.subscriptions(input),
  ])
}

export const FrontendFrontend = {
  init,
  update,
  subscriptions,
}
