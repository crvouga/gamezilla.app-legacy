import { Browser } from '~/@/browser'
import { IDbConnSql } from '~/@/db-conn-sql'
import { IHttpServer } from '~/@/http-server'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { ILogger } from '~/@/logger'
import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { AppBackendCtx } from './@/backend/ctx'
import { ClientId } from './@/data/client-id'
import { SessionId } from './@/data/session-id'
import { UserId } from './@/data/user-id'
import { AuthTypes } from './auth'
import { LangTypes } from './lang'
import { ProfileTypes } from './profile'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'
import { VisibilityFrontend } from './frontend/visibility'
import { IBackendTransport } from './wire/transport/backend'
import { IFrontendTransport } from './wire/transport/frontend'
import { ScreenSizeFrontend } from './frontend/screen-size'
import { CurrentScreenFrontend } from './frontend/current-screen'
import { ToastFrontend } from './frontend/toast'
import { SoundFrontend } from './frontend/sound'
import { StatusBarFrontend } from './frontend/status-bar'
import { CopyToClipboardFrontend } from './frontend/copy-to-clipboard'
import { FocusFrontend } from './frontend/focus'
import { TimeFrontend } from './frontend/time'

//
//
//
//
//
//
//

export type ModelFrontend = {
  auth: AuthTypes.ModelFrontend
  spaces: SpacesTypes.ModelFrontend
  profile: ProfileTypes.ModelFrontend
  wire: WireTypes.ModelFrontend
  lang: LangTypes.ModelFrontend
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

//
//
//
//
//
//
//

export type MsgBackend =
  | ({ t: '→'; c: MsgToBackend } & MsgToBackendMeta)
  | { t: 'wire'; c: WireTypes.MsgBackend }
  | { t: 'spaces'; c: SpacesTypes.MsgBackend }
  | { t: 'profile'; c: ProfileTypes.MsgBackend }
  | { t: 'auth'; c: AuthTypes.MsgBackend }
  | { t: 'lang'; c: LangTypes.MsgBackend }

export type MsgFrontend =
  | { t: '→'; c: MsgToFrontend }
  | { t: 'current-screen'; c: CurrentScreenFrontend.Msg }
  | { t: 'toast'; c: ToastFrontend.Msg }
  | { t: 'sound'; c: SoundFrontend.Msg }
  | { t: 'visibility'; c: VisibilityFrontend.Msg }
  | { t: 'screen-size'; c: ScreenSizeFrontend.Msg }
  | { t: 'status-bar'; c: StatusBarFrontend.Msg }
  | { t: 'focus'; c: FocusFrontend.Msg }
  | { t: 'time'; c: TimeFrontend.Msg }
  | { t: 'copy-to-clipboard'; c: CopyToClipboardFrontend.Msg }
  | { t: 'wire'; c: WireTypes.MsgFrontend }
  | { t: 'spaces'; c: SpacesTypes.MsgFrontend }
  | { t: 'auth'; c: AuthTypes.MsgFrontend }
  | { t: 'profile'; c: ProfileTypes.MsgFrontend }
  | { t: 'lang'; c: LangTypes.MsgFrontend }

export type MsgToBackend =
  | { t: 'spaces'; c: SpacesTypes.MsgToBackend }
  | { t: 'auth'; c: AuthTypes.MsgToBackend }
  | { t: 'profile'; c: ProfileTypes.MsgToBackend }
  | { t: 'wire'; c: WireTypes.MsgToBackend }
  | { t: 'lang'; c: LangTypes.MsgToBackend }

export type MsgToFrontend =
  | { t: 'spaces'; c: SpacesTypes.MsgToFrontend }
  | { t: 'auth'; c: AuthTypes.MsgToFrontend }
  | { t: 'profile'; c: ProfileTypes.MsgToFrontend }
  | { t: 'wire'; c: WireTypes.MsgToFrontend }
  | { t: 'lang'; c: LangTypes.MsgToFrontend }

//
//
//

export type MsgToBackendMeta = {
  sessionId: SessionId
  clientId: ClientId
  userId?: UserId | null
}

//
//
//
//
//

export const rpcContract = RPC.initContract({
  wire: WireTypes.rpcContract,
})

//
//
//
//

export type BackendCtx = AppBackendCtx & {
  transport: IBackendTransport<{
    MsgToFrontend: MsgToFrontend
    MsgToBackend: MsgToBackend
  }>
  wire: WireTypes.BackendCtx<MsgToFrontend, MsgToBackend>
  profile: ProfileTypes.BackendCtx
  space: SpacesTypes.BackendCtx
  auth: AuthTypes.BackendCtx
  httpServer: IHttpServer
}

export type FrontendCtx = {
  dbConnSql: IDbConnSql
  logger: ILogger
  now: Posix
  rpc: RPC.Client<typeof rpcContract>
  location: Browser.Location
  navigatorLanguage: LanguageCodeISO_639_1
  transport: IFrontendTransport<{
    MsgToBackend: MsgToBackend
    MsgToFrontend: MsgToFrontend
  }>
  stored: Record<string, unknown>
}

//
//
//
//
