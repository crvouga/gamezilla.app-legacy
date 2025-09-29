import { CopyToClipboardFrontend } from './copy-to-clipboard'
import { CurrentScreenFrontend } from './current-screen'
import { FocusFrontend } from './focus'
import { QueryCache } from './query-cache/query-cache'
import { ScreenSizeFrontend } from './screen-size'
import { ToasterFrontend } from './toaster'
import { ViewportFrontend } from './viewport'

export type ModelFrontend = CurrentScreenFrontend.Model &
  ToasterFrontend.Model &
  ViewportFrontend.Model &
  ScreenSizeFrontend.Model &
  CopyToClipboardFrontend.Model &
  FocusFrontend.Model &
  QueryCache

export type MsgFrontend =
  | CurrentScreenFrontend.Msg
  | ToasterFrontend.Msg
  | ViewportFrontend.Msg
  | ScreenSizeFrontend.Msg
  | FocusFrontend.Msg
  | CopyToClipboardFrontend.Msg
