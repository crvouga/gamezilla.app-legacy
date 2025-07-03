import { CopyToClipboardFrontend } from './copy-to-clipboard'
import { CurrentScreenFrontend } from './current-screen'
import { FocusFrontend } from './focus'
import { ScreenSizeFrontend } from './screen-size'
import { SoundFrontend } from '../settings/sound'
import { StatusBarFrontend } from '../settings/status-bar'
import { ToasterFrontend } from './toaster'
import { VisibilityFrontend } from './visibility'

export type ModelFrontend = {
  currentScreen: CurrentScreenFrontend.Model
  toast: ToasterFrontend.Model
  sound: SoundFrontend.Model
  visibility: VisibilityFrontend.Model
  screenSize: ScreenSizeFrontend.Model
  statusBar: StatusBarFrontend.Model
  copyToClipboard: CopyToClipboardFrontend.Model
  focus: FocusFrontend.Model
}

export type MsgFrontend =
  | { t: 'current-screen'; c: CurrentScreenFrontend.Msg }
  | { t: 'toast'; c: ToasterFrontend.Msg }
  | { t: 'sound'; c: SoundFrontend.Msg }
  | { t: 'visibility'; c: VisibilityFrontend.Msg }
  | { t: 'screen-size'; c: ScreenSizeFrontend.Msg }
  | { t: 'status-bar'; c: StatusBarFrontend.Msg }
  | { t: 'focus'; c: FocusFrontend.Msg }
  | { t: 'copy-to-clipboard'; c: CopyToClipboardFrontend.Msg }
