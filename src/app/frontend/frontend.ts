import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
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
import { VisibilityFrontend } from './visibility'

const init = (input: {
  ctx: AppFrontendCtxBase
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  const screen = CurrentScreenFrontend.init(input)
  const visibility = VisibilityFrontend.init(input)
  const screenSize = ScreenSizeFrontend.init(input)
  const toast = ToasterFrontend.init(input)
  const focus = FocusFrontend.init()
  const copyToClipboard = CopyToClipboardFrontend.init()

  const initialModel: ModelFrontend = {
    focus: focus.model,
    currentScreen: screen.model,
    toast: toast.model,
    visibility: visibility.model,
    screenSize: screenSize.model,
    copyToClipboard: copyToClipboard.model,
    queryCache: QueryCache.init,
  }

  const initialEff = Eff.batch<MsgFrontend>([screen.eff, Eff.tag('toast', toast.eff)])

  return {
    model: initialModel,
    eff: initialEff,
    msgOut: [PreloadSoundsCmd.init(Object.values(APP_SOUND))],
  }
}

const update = (input: {
  ctx: AppFrontendCtxBase
  model: ModelFrontend
  msg?: MsgFrontend
  msgIn?: unknown
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  const screen = CurrentScreenFrontend.update({
    ctx: input.ctx,
    model: input.model.currentScreen,
    msg: input.msg?.t === 'current-screen' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const visibility = VisibilityFrontend.update({
    model: input.model.visibility,
    msg: input.msg?.t === 'visibility' ? input.msg.c : null,
  })

  const toast = ToasterFrontend.update({
    model: input.model.toast,
    msg: input.msg?.t === 'toast' ? input.msg.c : null,
    ctx: input.ctx,
    msgIn: input.msgIn,
  })

  const screenSize = ScreenSizeFrontend.update({
    model: input.model.screenSize,
    msg: input.msg?.t === 'screen-size' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const copyToClipboard = CopyToClipboardFrontend.update({
    model: input.model.copyToClipboard,
    msg: input.msg?.t === 'copy-to-clipboard' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const focus = FocusFrontend.update({
    model: input.model.focus,
    msg: input.msg?.t === 'focus' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const queryCache = QueryCache.update({
    model: input.model.queryCache,
    msgIn: input.msgIn,
  })

  return {
    model: {
      queryCache: queryCache.model,
      focus: focus.model,
      visibility: visibility.model,
      currentScreen: screen.model,
      toast: toast.model,
      screenSize: screenSize.model,
      copyToClipboard: copyToClipboard.model,
    },
    msgOut: Msg.batch(screen.msgOut, toast.msgOut, visibility.msgOut),
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('visibility', visibility.eff),
      Eff.tag('current-screen', screen.eff),
      Eff.tag('toast', toast.eff),
      Eff.tag('copy-to-clipboard', copyToClipboard.eff),
      Eff.tag('focus', focus.eff),
    ]),
  }
}

const subscriptions = (input: { ctx: AppFrontendCtxBase; model: ModelFrontend }): Sub<MsgFrontend> => {
  return Sub.batch<MsgFrontend>([
    Sub.map(VisibilityFrontend.subscriptions(input), (c): MsgFrontend => ({ t: 'visibility', c })),
    Sub.map(FocusFrontend.subscriptions, (c): MsgFrontend => ({ t: 'focus', c })),
    Sub.map(CopyToClipboardFrontend.subscriptions, (c): MsgFrontend => ({ t: 'copy-to-clipboard', c })),
    Sub.map(ScreenSizeFrontend.subscriptions(input), (c): MsgFrontend => ({ t: 'screen-size', c })),
    Sub.map(CurrentScreenFrontend.subscriptions(input), (c): MsgFrontend => ({ t: 'current-screen', c })),
    Sub.map(
      ToasterFrontend.subscriptions({ ctx: input.ctx, model: input.model.toast }),
      (c): MsgFrontend => ({ t: 'toast', c }),
    ),
  ])
}

export const FrontendFrontend = {
  init,
  update,
  subscriptions,
}
