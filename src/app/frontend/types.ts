import { CopyToClipboardFrontend } from './copy-to-clipboard'
import { CurrentScreenFrontend } from './current-screen'
import { FocusFrontend } from './focus'
import { QueryCache } from './query-cache/query-cache'
import { ScreenSizeFrontend } from './screen-size'
import { ToasterFrontend } from './toaster'
import { VisibilityFrontend } from './visibility'

export type ModelFrontend = {
  currentScreen: CurrentScreenFrontend.Model
  toast: ToasterFrontend.Model
  visibility: VisibilityFrontend.Model
  screenSize: ScreenSizeFrontend.Model
  copyToClipboard: CopyToClipboardFrontend.Model
  focus: FocusFrontend.Model
  queryCache: QueryCache
}

export type MsgFrontend =
  | { t: 'current-screen'; c: CurrentScreenFrontend.Msg }
  | { t: 'toast'; c: ToasterFrontend.Msg }
  | { t: 'visibility'; c: VisibilityFrontend.Msg }
  | { t: 'screen-size'; c: ScreenSizeFrontend.Msg }
  | { t: 'focus'; c: FocusFrontend.Msg }
  | { t: 'copy-to-clipboard'; c: CopyToClipboardFrontend.Msg }
