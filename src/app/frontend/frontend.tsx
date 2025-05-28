import { Browser } from '~/@/browser'
import { Eff } from '~/@/eff'
import { Msg } from '~/@/msg/msg'
import { Sub } from '~/@/sub'
import {
  APP_SOUND,
  AppFrontendCmd,
  CopyToClipboardCmd,
  FocusCmd,
  preloadSound,
  ScreenCmd,
  SoundCmd,
  StatusBarCmd,
  TimeCmd,
  ToastCmd,
} from '../@/frontend/cmd'
import { AnonymousFrontendCtx, AppFrontendCtx } from '../@/frontend/ctx'
import { AppFrontendEvt } from '../@/frontend/evt'
import { CopyToClipboardFrontend } from '../frontend/copy-to-clipboard'
import { CurrentScreenFrontend } from '../frontend/current-screen'
import { FocusFrontend } from '../frontend/focus'
import { ScreenSizeFrontend } from '../frontend/screen-size'
import { SoundFrontend } from '../frontend/sound'
import { StatusBarFrontend } from '../frontend/status-bar/index'
import { TimeFrontend } from '../frontend/time'
import { ToastFrontend } from '../frontend/toast'
import { VisibilityFrontend } from '../frontend/visibility'
import { type ModelFrontend, type MsgFrontend, type MsgToBackend, type MsgToFrontend } from './types'
import './update-prompt/update-prompt'

export const init = (input: {
  ctx: AnonymousFrontendCtx
  stored: Record<string, unknown>
  location: Browser.Location
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
} => {
  const screen = CurrentScreenFrontend.init({ location: input.location })
  const visibility = VisibilityFrontend.init({ stored: input.stored })
  const screenSize = ScreenSizeFrontend.init()
  const toast = ToastFrontend.init({ stored: input.stored, ctx: input.ctx })
  const sound = SoundFrontend.init({ ctx: input.ctx, stored: input.stored })
  const statusBar = StatusBarFrontend.init({ stored: input.stored })
  const focus = FocusFrontend.init()
  const copyToClipboard = CopyToClipboardFrontend.init()
  const time = TimeFrontend.init()

  const initialModel: ModelFrontend = {
    time: time.model,
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

  const initialCmd = Msg.batch<AppFrontendCmd<{ MsgToBackend: MsgToBackend; MsgFrontend: MsgFrontend }>>(
    preloadSound(Object.values(APP_SOUND)),
  )

  return {
    model: initialModel,
    eff: initialEff,
    msgCmd: initialCmd,
  }
}

export type CmdIn<TParentMsg> =
  | ToastCmd
  | ScreenCmd
  | SoundCmd
  | FocusCmd
  | TimeCmd<TParentMsg>
  | CopyToClipboardCmd
  | StatusBarCmd

export const update = <TParentMsg,>(input: {
  ctx: AppFrontendCtx | AnonymousFrontendCtx
  model: ModelFrontend
  msg?: MsgFrontend
  msgBackend?: MsgToFrontend
  msgEvt?: AppFrontendEvt
  msgCmd?: CmdIn<TParentMsg>
  msgIn?: unknown
}): {
  model: ModelFrontend
  eff?: Eff<MsgFrontend>
  msgEvt?: AppFrontendEvt[]
  msgCmd?: AppFrontendCmd<{
    MsgToBackend: MsgToBackend
    MsgFrontend: MsgFrontend
  }>[]
} => {
  const screen = CurrentScreenFrontend.update({
    model: input.model.currentScreen,
    msg: input.msg?.t === 'current-screen' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'current-screen' ? input.msgCmd : null,
    msgIn: input.msgIn,
  })

  const sound = SoundFrontend.update({
    model: input.model.sound,
    msg: input.msg?.t === 'sound' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'sound' ? input.msgCmd : null,
    ctx: input.ctx,
    msgIn: input.msgIn,
  })

  const visibility = VisibilityFrontend.update({
    model: input.model.visibility,
    msg: input.msg?.t === 'visibility' ? input.msg.c : null,
  })

  const statusBar = StatusBarFrontend.update({
    model: input.model.statusBar,
    msg: input.msg?.t === 'status-bar' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'status-bar' ? input.msgCmd : null,
  })

  const toast = ToastFrontend.update({
    model: input.model.toast,
    msg: input.msg?.t === 'toast' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'toast' ? input.msgCmd : null,
    ctx: input.ctx,
  })

  const screenSize = ScreenSizeFrontend.update({
    model: input.model.screenSize,
    msg: input.msg?.t === 'screen-size' ? input.msg.c : null,
  })

  const copyToClipboard = CopyToClipboardFrontend.update({
    model: input.model.copyToClipboard,
    msg: input.msg?.t === 'copy-to-clipboard' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'copy-to-clipboard' ? input.msgCmd : null,
  })

  const focus = FocusFrontend.update({
    model: input.model.focus,
    msg: input.msg?.t === 'focus' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'focus' ? input.msgCmd : null,
  })

  const time = TimeFrontend.update({
    model: input.model.time,
    msg: input.msg?.t === 'time' ? input.msg.c : null,
    msgCmd: input.msgCmd?.t === 'time' ? input.msgCmd : null,
  })

  return {
    model: {
      time: time.model,
      focus: focus.model,
      visibility: visibility.model,
      currentScreen: screen.model,
      sound: sound.model,
      statusBar: statusBar.model,
      toast: toast.model,
      screenSize: screenSize.model,
      copyToClipboard: copyToClipboard.model,
    },
    eff: Eff.batch<MsgFrontend>([
      Eff.tag('visibility', visibility.eff),
      Eff.tag('current-screen', screen.eff),
      Eff.tag('sound', sound.eff),
      Eff.tag('toast', toast.eff),
      Eff.tag('copy-to-clipboard', copyToClipboard.eff),
      Eff.tag('focus', focus.eff),
      Eff.tag('time', time.eff),
      //   time.parentEff,
    ]),
    msgEvt: Msg.batch<AppFrontendEvt>(screen.msgEvt, sound.msgEvt, toast.msgEvt),
    msgCmd: Msg.batch<AppFrontendCmd<{ MsgToBackend: MsgToBackend; MsgFrontend: MsgFrontend }>>(
      statusBar.msgCmd,
      screen.msgCmd,
      sound.msgCmd,
      toast.msgCmd,
    ),
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
    Sub.tag('time', TimeFrontend.subscriptions),
    Sub.tag('screen-size', ScreenSizeFrontend.subscriptions),
    Sub.tag('current-screen', CurrentScreenFrontend.subscriptions),
    Sub.tag('toast', ToastFrontend.subscriptions({ ctx: input.ctx, model: input.model.toast })),
  ])
}
