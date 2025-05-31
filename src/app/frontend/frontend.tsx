import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import { APP_SOUND } from '../@/frontend/app-sound'
import { AnonymousFrontendCtx, AppFrontendCtx, AppFrontendCtxBase } from '../@/frontend/ctx'
import { PreloadSoundsCmd } from '../@/frontend/preload-sounds-cmd'
import { CopyToClipboardFrontend } from '../frontend/copy-to-clipboard'
import { CurrentScreenFrontend } from '../frontend/current-screen'
import { FocusFrontend } from '../frontend/focus'
import { ScreenSizeFrontend } from '../frontend/screen-size'
import { SoundFrontend } from '../frontend/sound'
import { StatusBarFrontend } from '../frontend/status-bar/index'
import { ToastFrontend } from '../frontend/toast'
import { VisibilityFrontend } from '../frontend/visibility'
import { type ModelFrontend, type MsgFrontend } from './types'
import './update-prompt/update-prompt'

export const init = (input: {
  ctx: AnonymousFrontendCtx
  location: Browser.Location
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgOut?: unknown[]
} => {
  const screen = CurrentScreenFrontend.init({ location: input.location })
  const visibility = VisibilityFrontend.init()
  const screenSize = ScreenSizeFrontend.init()
  const toast = ToastFrontend.init({ ctx: input.ctx })
  const sound = SoundFrontend.init({ ctx: input.ctx })
  const statusBar = StatusBarFrontend.init()
  const focus = FocusFrontend.init()
  const copyToClipboard = CopyToClipboardFrontend.init()

  const initialModel: ModelFrontend = {
    focus: focus.model,
    statusBar: statusBar.model,
    currentScreen: screen.model,
    toast: toast.model,
    sound: sound.model,
    visibility: visibility.model,
    screenSize: screenSize.model,
    copyToClipboard: copyToClipboard.model,
  }

  const initialEff = Eff.batch<MsgFrontend>([screen.eff, Eff.tag('toast', toast.eff)])

  return {
    model: initialModel,
    eff: initialEff,
    msgOut: [PreloadSoundsCmd.init(Object.values(APP_SOUND))],
  }
}

export const update = (input: {
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
    model: input.model.currentScreen,
    msg: input.msg?.t === 'current-screen' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const sound = SoundFrontend.update({
    model: input.model.sound,
    msg: input.msg?.t === 'sound' ? input.msg.c : null,
    ctx: input.ctx,
    msgIn: input.msgIn,
  })

  const visibility = VisibilityFrontend.update({
    model: input.model.visibility,
    msg: input.msg?.t === 'visibility' ? input.msg.c : null,
    // msgIn: input.msgIn,
  })

  const statusBar = StatusBarFrontend.update({
    model: input.model.statusBar,
    msg: input.msg?.t === 'status-bar' ? input.msg.c : null,
    msgIn: input.msgIn,
  })

  const toast = ToastFrontend.update({
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

  return {
    model: {
      focus: focus.model,
      visibility: visibility.model,
      currentScreen: screen.model,
      sound: sound.model,
      statusBar: statusBar.model,
      toast: toast.model,
      screenSize: screenSize.model,
      copyToClipboard: copyToClipboard.model,
    },
    msgOut: Msg.batch(screen.msgOut, statusBar.msgOut, toast.msgOut),
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('visibility', visibility.eff),
      Eff.tag('current-screen', screen.eff),
      Eff.tag('sound', sound.eff),
      Eff.tag('toast', toast.eff),
      Eff.tag('copy-to-clipboard', copyToClipboard.eff),
      Eff.tag('focus', focus.eff),
    ]),
  }
}

export const subscriptions = (input: {
  ctx: AppFrontendCtx | AnonymousFrontendCtx
  model: ModelFrontend
}): Sub<MsgFrontend> => {
  return Sub.batch<MsgFrontend>([
    Sub.tag('visibility', VisibilityFrontend.subscriptions),
    Sub.tag('focus', FocusFrontend.subscriptions),
    Sub.tag('copy-to-clipboard', CopyToClipboardFrontend.subscriptions),
    Sub.tag('screen-size', ScreenSizeFrontend.subscriptions),
    Sub.tag('current-screen', CurrentScreenFrontend.subscriptions),
    Sub.tag('toast', ToastFrontend.subscriptions({ ctx: input.ctx, model: input.model.toast })),
  ])
}
