import { Browser } from '~/@/browser'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { IHttpServer } from '~/@/http-server'
import { FrontendId } from './@/data/frontend-id'
import { SessionId } from './@/data/session-id'
import { UserId } from './@/data/user-id'
import { AppBackendCtx } from './@/backend/ctx'
import type { Platform, Routing, Sound, StatusBar, Toast } from './app-frontend'
import { AuthTypes } from './auth'
import { LangTypes } from './lang'
import { ProfileTypes } from './profile'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'
import { IFrontendTransport } from './wire/transport/frontend'
import { IBackendTransport } from './wire/transport/backend'

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
  routing: Routing.Model
  toast: Toast.Model
  sound: Sound.Model
  platform: Platform.Model
  statusBar: StatusBar.Model
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
  | { t: 'routing'; c: Routing.Msg }
  | { t: 'toast'; c: Toast.Msg }
  | { t: 'sound'; c: Sound.Msg }
  | { t: 'platform'; c: Platform.Msg }
  | { t: 'status-bar'; c: StatusBar.Msg }
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
  frontendId: FrontendId
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
  now: Posix
  rpc: RPC.Frontend<typeof rpcContract>
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
