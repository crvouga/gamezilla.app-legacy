import { CopyToClipboardFrontend } from './copy-to-clipboard'
import { CurrentScreenFrontend } from './current-screen'
import { FocusFrontend } from './focus'
import { ScreenSizeFrontend } from './screen-size'
import { SoundFrontend } from './sound'
import { StatusBarFrontend } from './status-bar'
import { TimeFrontend } from './time'
import { ToastFrontend } from './toast'
import { VisibilityFrontend } from './visibility'

//
//
//
//
//
//
//

export type ModelFrontend = {
  currentScreen: CurrentScreenFrontend.Model
  toast: ToastFrontend.Model
  sound: SoundFrontend.Model
  visibility: VisibilityFrontend.Model
  screenSize: ScreenSizeFrontend.Model
  statusBar: StatusBarFrontend.Model
  copyToClipboard: CopyToClipboardFrontend.Model
  focus: FocusFrontend.Model
  time: TimeFrontend.Model
}

export type MsgBackend = { t: 'noop' }

export type MsgFrontend =
  | { t: 'current-screen'; c: CurrentScreenFrontend.Msg }
  | { t: 'toast'; c: ToastFrontend.Msg }
  | { t: 'sound'; c: SoundFrontend.Msg }
  | { t: 'visibility'; c: VisibilityFrontend.Msg }
  | { t: 'screen-size'; c: ScreenSizeFrontend.Msg }
  | { t: 'status-bar'; c: StatusBarFrontend.Msg }
  | { t: 'focus'; c: FocusFrontend.Msg }
  | { t: 'time'; c: TimeFrontend.Msg }
  | { t: 'copy-to-clipboard'; c: CopyToClipboardFrontend.Msg }

export type MsgToBackend = { t: 'noop' }

export type MsgToFrontend = { t: 'noop' }
