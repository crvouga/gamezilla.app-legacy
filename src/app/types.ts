import { Browser } from '~/@/browser'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { IWebBackend } from '~/@/web-server'
import { ClientId } from './@/data/client-id'
import { SessionId } from './@/data/session-id'
import { UserId } from './@/data/user-id'
import { AppBackendCtx } from './@/server/ctx'
import type { Platform, Routing, Sound, StatusBar, Toast } from './app-client'
import { AuthTypes } from './auth'
import { LangTypes } from './lang'
import { ProfileTypes } from './profile'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'
import { IClientTransport } from './wire/transport/client'
import { IBackendTransport } from './wire/transport/server'

//
//
//
//
//
//
//

export type ModelClient = {
  auth: AuthTypes.ModelClient
  spaces: SpacesTypes.ModelClient
  profile: ProfileTypes.ModelClient
  wire: WireTypes.ModelClient
  lang: LangTypes.ModelClient
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

export type MsgClient =
  | { t: '→'; c: MsgToClient }
  | { t: 'routing'; c: Routing.Msg }
  | { t: 'toast'; c: Toast.Msg }
  | { t: 'sound'; c: Sound.Msg }
  | { t: 'platform'; c: Platform.Msg }
  | { t: 'status-bar'; c: StatusBar.Msg }
  | { t: 'wire'; c: WireTypes.MsgClient }
  | { t: 'spaces'; c: SpacesTypes.MsgClient }
  | { t: 'auth'; c: AuthTypes.MsgClient }
  | { t: 'profile'; c: ProfileTypes.MsgClient }
  | { t: 'lang'; c: LangTypes.MsgClient }

export type MsgToBackend =
  | { t: 'spaces'; c: SpacesTypes.MsgToBackend }
  | { t: 'auth'; c: AuthTypes.MsgToBackend }
  | { t: 'profile'; c: ProfileTypes.MsgToBackend }
  | { t: 'wire'; c: WireTypes.MsgToBackend }
  | { t: 'lang'; c: LangTypes.MsgToBackend }

export type MsgToClient =
  | { t: 'spaces'; c: SpacesTypes.MsgToClient }
  | { t: 'auth'; c: AuthTypes.MsgToClient }
  | { t: 'profile'; c: ProfileTypes.MsgToClient }
  | { t: 'wire'; c: WireTypes.MsgToClient }
  | { t: 'lang'; c: LangTypes.MsgToClient }

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
    MsgToClient: MsgToClient
    MsgToBackend: MsgToBackend
  }>
  wire: WireTypes.BackendCtx<MsgToClient, MsgToBackend>
  profile: ProfileTypes.BackendCtx
  space: SpacesTypes.BackendCtx
  auth: AuthTypes.BackendCtx
  webBackend: IWebBackend
}

export type ClientCtx = {
  now: Posix
  rpc: RPC.Client<typeof rpcContract>
  location: Browser.Location
  navigatorLanguage: LanguageCodeISO_639_1
  transport: IClientTransport<{
    MsgToBackend: MsgToBackend
    MsgToClient: MsgToClient
  }>
  stored: Record<string, unknown>
}

//
//
//
//
