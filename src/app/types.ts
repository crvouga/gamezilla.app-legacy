import { Browser } from '~/@/browser'
import { LanguageCodeISO_639_1 } from '~/@/l18n'
import { RPC } from '~/@/rpc'
import { Posix } from '~/@/time/posix'
import { IWebServer } from '~/@/web-server'
import { ClientId } from './@/data/client-id'
import { SessionId } from './@/data/session-id'
import { UserId } from './@/data/user-id'
import { AppServerCtx } from './@/server/server-ctx'
import type { Platform, Routing, Sound, StatusBar, Toast } from './app-client'
import { AuthTypes } from './auth'
import { LangTypes } from './lang'
import { ProfileTypes } from './profile'
import { SpacesTypes } from './spaces'
import { WireTypes } from './wire'
import { IClientTransport } from './wire/transport/client'
import { IServerTransport } from './wire/transport/server'

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

export type MsgServer =
  | ({ t: '→'; c: MsgToServer } & MsgToServerMeta)
  | { t: 'wire'; c: WireTypes.MsgServer }
  | { t: 'spaces'; c: SpacesTypes.MsgServer }
  | { t: 'profile'; c: ProfileTypes.MsgServer }
  | { t: 'auth'; c: AuthTypes.MsgServer }
  | { t: 'lang'; c: LangTypes.MsgServer }

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

export type MsgToServer =
  | { t: 'spaces'; c: SpacesTypes.MsgToServer }
  | { t: 'auth'; c: AuthTypes.MsgToServer }
  | { t: 'profile'; c: ProfileTypes.MsgToServer }
  | { t: 'wire'; c: WireTypes.MsgToServer }
  | { t: 'lang'; c: LangTypes.MsgToServer }

export type MsgToClient =
  | { t: 'spaces'; c: SpacesTypes.MsgToClient }
  | { t: 'auth'; c: AuthTypes.MsgToClient }
  | { t: 'profile'; c: ProfileTypes.MsgToClient }
  | { t: 'wire'; c: WireTypes.MsgToClient }
  | { t: 'lang'; c: LangTypes.MsgToClient }

//
//
//

export type MsgToServerMeta = {
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
  wire: WireTypes.rpcContract
})

//
//
//
//

export type ServerCtx = AppServerCtx & {
  transport: IServerTransport<{
    MsgToClient: MsgToClient
    MsgToServer: MsgToServer
  }>
  wire: WireTypes.ServerCtx<MsgToClient, MsgToServer>
  profile: ProfileTypes.ServerCtx
  space: SpacesTypes.ServerCtx
  auth: AuthTypes.ServerCtx
  webServer: IWebServer
}

export type ClientCtx = {
  now: Posix
  rpc: RPC.Client<typeof rpcContract>
  location: Browser.Location
  navigatorLanguage: LanguageCodeISO_639_1
  transport: IClientTransport<{
    MsgToServer: MsgToServer
    MsgToClient: MsgToClient
  }>
  stored: Record<string, unknown>
}

//
//
//
//
